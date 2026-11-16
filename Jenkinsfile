pipeline {
    agent any
    options {
        timestamps()
        skipDefaultCheckout(true)
        // Stop later stages if a publisher marks the build UNSTABLE/FAILURE mid-run
        skipStagesAfterUnstable()
    }
    environment {
        COMPOSER_ALLOW_SUPERUSER = '1'
        COMPOSER_NO_INTERACTION = '1'
    }
    stages {
        // ============================================================
        // CHECKOUT
        // ============================================================
        stage('Checkout') {
            // Use the Jenkins node for checkout; build containers do not need Git.
            steps {
                checkout scm
            }
        }
        // ============================================================
        // INSTALL DEPENDENCIES
        // ============================================================
        stage('Install PHP Dependencies') {
            agent {
                docker {
                    image 'delcom-ci-php:8.5'
                    reuseNode true
                    args '-u root'
                }
            }
            steps {
                sh '''
                    set -e
                    echo "=== PHP Runtime ==="
                    php -v
                    echo "=== Checking required PHP extensions ==="
                    php -r '
                        $required = ["ctype", "curl", "dom", "fileinfo", "filter", "hash", "mbstring", "openssl", "pcre", "pdo", "session", "tokenizer", "xml", "pdo_sqlite", "gd", "zip", "iconv", "simplexml", "xmlreader", "xmlwriter", "zlib", "bcmath", "exif"];
                        $missing = array_filter($required, fn ($ext) => !extension_loaded($ext));
                        if ($missing) {
                            fwrite(STDERR, "Missing PHP extensions: " . implode(", ", $missing) . PHP_EOL);
                            exit(1);
                        }
                        echo "OK: required extensions are available." . PHP_EOL;
                    '
                    echo "=== Installing PHP Dependencies ==="
                    composer install --prefer-dist --no-progress --optimize-autoloader
                    echo "=== PHP Dependencies Installed ==="
                    composer audit --no-interaction
                    echo "=== Composer Audit Passed ==="
                '''
            }
        }
        // ============================================================
        // BUILD FRONTEND
        // ============================================================
        stage('Install & Build Frontend') {
            agent {
                docker {
                    image 'node:24-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    set -e
                    echo "=== Installing Frontend Dependencies ==="
                    if [ -f package-lock.json ]; then
                        npm ci --ignore-scripts
                    else
                        npm install --ignore-scripts
                    fi
                    echo "=== Building Vite Assets ==="
                    npm run build
                    echo "=== Frontend Build Complete ==="
                '''
            }
        }
        // ============================================================
        // TEST
        // ============================================================
        stage('Test') {
            agent {
                docker {
                    image 'delcom-ci-php:8.5'
                    reuseNode true
                    args '-u root'
                }
            }
            steps {
                sh '''
                    set -e
                    echo "=== Checking PHP test and coverage extensions ==="
                    php -r '
                        foreach (["gd", "zip", "mbstring", "pdo_sqlite"] as $ext) {
                            if (!extension_loaded($ext)) {
                                fwrite(STDERR, "Missing PHP extension: {$ext}" . PHP_EOL);
                                exit(1);
                            }
                        }
                        if (!extension_loaded("pcov") && !extension_loaded("xdebug")) {
                            fwrite(STDERR, "Coverage requires pcov or xdebug." . PHP_EOL);
                            exit(1);
                        }
                        echo "OK: test extensions and coverage driver are available." . PHP_EOL;
                    '

                    echo "=== Preparing Laravel Testing Environment ==="
                    mkdir -p storage/framework/views storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/logs bootstrap/cache
                    chmod -R 775 storage bootstrap/cache || true
                    if [ ! -f .env ]; then cp .env.example .env; fi
                    php artisan key:generate --force
                    php artisan config:clear
                    php artisan view:clear

                    echo "=== Running PHPUnit with Coverage ==="
                    php vendor/bin/phpunit \
                        --colors=never \
                        --coverage-text=coverage.txt \
                        --coverage-clover=coverage.xml \
                        --coverage-html=coverage-html

                    echo "=== Enforcing 100% application coverage ==="
                    php -r '
                        if (!is_file("coverage.xml")) {
                            fwrite(STDERR, "coverage.xml was not generated." . PHP_EOL);
                            exit(1);
                        }
                        $xml = @simplexml_load_file("coverage.xml");
                        $metrics = $xml->project->metrics ?? null;
                        if ($xml === false || $metrics === null) {
                            fwrite(STDERR, "Coverage metrics could not be read." . PHP_EOL);
                            exit(1);
                        }
                        $checks = [
                            "statements" => ["coveredstatements", "statements"],
                            "methods" => ["coveredmethods", "methods"],
                            "elements" => ["coveredelements", "elements"],
                        ];
                        foreach ($checks as $label => [$coveredKey, $totalKey]) {
                            $covered = (int) $metrics[$coveredKey];
                            $total = (int) $metrics[$totalKey];
                            if ($total > 0 && $covered < $total) {
                                fwrite(STDERR, "{$label} coverage is below 100% ({$covered}/{$total})." . PHP_EOL);
                                exit(1);
                            }
                        }
                        echo "OK: application coverage is 100%." . PHP_EOL;
                    '
                    ls -lh coverage.xml coverage.txt || true
                    echo "=== Tests Passed ==="
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage.txt,coverage.xml', allowEmptyArchive: true
                }
            }
        }
        // ============================================================
        // TRIVY SECURITY SCAN
        // ============================================================
        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true
                    args '''
                        --entrypoint=""
                        -e HOME=/tmp
                        -e XDG_CACHE_HOME=/tmp/.cache
                    '''
                }
            }
            steps {
                sh '''
                    set -e
                    mkdir -p .trivy-cache || true
                    echo "======================================"
                    echo "        TRIVY SECURITY SCAN"
                    echo "======================================"
                    echo "=== Trivy Version ==="
                    trivy --version
                    echo "=== Trivy Scan ==="
                    trivy fs \
                        --cache-dir .trivy-cache \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --skip-dirs vendor \
                        --skip-dirs node_modules \
                        --skip-dirs coverage-html \
                        --skip-dirs storage \
                        --skip-dirs bootstrap/cache \
                        --format sarif \
                        --output trivy-results.sarif \
                        --exit-code 1 \
                        .
                    echo "=== Trivy Result ==="
                    ls -lh trivy-results.sarif
                '''
            }
            post {
                always {
                    // failOnError must be false: otherwise Warnings NG can mark the
                    // whole build FAILURE while later stages still run (all green, badge red).
                    // Build failure on HIGH/CRITICAL comes from trivy --exit-code 1 above.
                    recordIssues(
                        enabledForFailure: true,
                        failOnError: false,
                        tools: [
                            sarif(
                                id: 'trivy',
                                name: 'Trivy Security',
                                pattern: 'trivy-results.sarif'
                            )
                        ]
                    )
                }
            }
        }
        // ============================================================
        // PACKAGE APPLICATION
        // ============================================================
        stage('Package Application') {
            agent {
                docker {
                    image 'delcom-ci-php:8.5'
                    reuseNode true
                    args '-u root'
                }
            }
            steps {
                sh '''
                    set -e
                    echo "======================================"
                    echo "       CREATING APPLICATION PACKAGE"
                    echo "======================================"
                    rm -f latest-app.zip
                    zip -r latest-app.zip . \
                        -x "vendor/*" \
                        -x "node_modules/*" \
                        -x ".git/*" \
                        -x ".env" \
                        -x ".env.backup" \
                        -x ".env.production" \
                        -x ".env.local" \
                        -x "coverage/*" \
                        -x "coverage-html/*" \
                        -x "coverage.txt" \
                        -x "coverage.xml" \
                        -x ".trivy-cache/*" \
                        -x "latest-app.zip" \
                        -x "trivy-results.sarif" \
                        -x ".docs/*" \
                        -x "tests/*" \
                        -x "storage/logs/*" \
                        -x "storage/framework/cache/data/*" \
                        -x "storage/framework/sessions/*" \
                        -x "storage/framework/views/*" \
                        -x "storage/framework/testing/*" \
                        -x "bootstrap/cache/*.php" \
                        -x "*.exe"
                    echo "=== Application Package Created ==="
                    ls -lh latest-app.zip
                    echo "=== Verifying generated dependencies are excluded ==="
                    if unzip -Z1 latest-app.zip | grep -E '^(vendor|node_modules)(/|$)' >/dev/null; then
                        echo "ERROR: package unexpectedly includes vendor/ or node_modules/"
                        exit 1
                    fi
                    echo "OK: vendor/ and node_modules/ are excluded"
                    echo "=== Verifying Windows executables are excluded ==="
                    if unzip -Z1 latest-app.zip | grep -Ei '[.]exe$' >/dev/null; then
                        echo "ERROR: package unexpectedly includes a Windows executable"
                        exit 1
                    fi
                    echo "OK: no Windows executables in package"
                    unzip -l latest-app.zip | head -n 80
                '''
            }
        }
        // ============================================================
        // PUBLISH APPLICATION
        // ============================================================
        stage('Publish Application') {
            steps {
                // ========================================================
                // 1. ARCHIVE ARTIFACT KE JENKINS
                // ========================================================
                archiveArtifacts(
                    artifacts: 'latest-app.zip',
                    fingerprint: true,
                    allowEmptyArchive: false
                )
                script {
                    // ====================================================
                    // 2. BUAT IDENTITAS APPLICATION
                    // ====================================================
                    def appName = env.JOB_NAME
                        .replaceAll('[^a-zA-Z0-9._-]', '-')
                        .replaceAll('-+', '-')
                        .replaceAll('^-|-$', '')
                    def buildId = env.BUILD_NUMBER
                    echo "Application Name: ${appName}"
                    echo "Build ID: ${buildId}"
                    // ====================================================
                    // 3. COPY KE USER CONTENT
                    // ====================================================
                    sh """
                        set -e
                        echo "======================================"
                        echo "       PUBLISHING USER CONTENT"
                        echo "======================================"
                        docker exec cicd-jenkins \
                            mkdir -p \
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}"
                        docker cp \
                            latest-app.zip \
                            "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                        echo "=== Published File ==="
                        docker exec cicd-jenkins \
                            ls -lh \
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    """
                    // ====================================================
                    // 4. BUAT PUBLIC ARTIFACT URL
                    // ====================================================
                    def jenkinsBaseUrl = env.BUILD_URL
                        .substring(0, env.BUILD_URL.indexOf('/job/'))
                        .replace('localhost', 'host.docker.internal')
                    env.ARTIFACT_URL =
                        "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    echo "======================================"
                    echo "       APPLICATION PUBLISHED"
                    echo "======================================"
                    echo "Artifact URL:"
                    echo "${env.ARTIFACT_URL}"
                }
            }
        }
        // ============================================================
        // DEPLOY APPLICATION
        // ============================================================
        stage('Deploy Application') {
            agent {
                docker {
                    image 'curlimages/curl:8.15.0'
                    reuseNode true
                    args '--network cicd-network'
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "       START APPLICATION DEPLOYMENT"
                    echo "=========================================="
                    echo "Artifact URL:"
                    echo "${env.ARTIFACT_URL}"
                    // ==================================================
                    // 1. REQUEST REDEPLOYMENT
                    // ==================================================
                    echo ""
                    echo "=== Request Redeployment ==="
                    def redeployResponse = sh(
                        script: '''
                            set +x
                            set -e
                            curl -sS --fail-with-body \
                                -X POST "$URL_REDEPLOY" \
                                -H "Content-Type: application/json" \
                                -d "{
                                    \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                                    \\"website_id\\": \\"$WEBSITE_ID\\",
                                    \\"source_url\\": \\"$ARTIFACT_URL\\",
                                    \\"source_type\\": \\"jenkins\\"
                                }"
                        ''',
                        returnStdout: true
                    ).trim()
                    echo "Redeploy Response:"
                    echo redeployResponse
                    // ==================================================
                    // 2. POLLING DEPLOYMENT PROGRESS
                    // ==================================================
                    echo ""
                    echo "=== Waiting For Deployment ==="
                    def maxAttempts = 120
                    def attempt = 0
                    def deploymentStatus = 'IN_PROGRESS'
                    while (deploymentStatus == 'IN_PROGRESS') {
                        attempt++
                        if (attempt > maxAttempts) {
                            error(
                                "Deployment timeout. " +
                                "Status masih IN_PROGRESS setelah " +
                                "${maxAttempts} attempts."
                            )
                        }
                        sleep time: 5, unit: 'SECONDS'
                        echo ""
                        echo "=== Checking Deployment Progress (${attempt}/${maxAttempts}) ==="
                        def progressResponse = sh(
                            script: '''
                                set +x
                                set -e
                                curl -sS --fail-with-body \
                                    -X POST "$URL_PROGRESS" \
                                    -H "Content-Type: application/json" \
                                    -d "{
                                        \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                                        \\"website_id\\": \\"$WEBSITE_ID\\"
                                    }"
                            ''',
                            returnStdout: true
                        ).trim()
                        echo "Progress Response:"
                        echo progressResponse
                        // ==================================================
                        // PARSE JSON
                        // ==================================================
                        def json = readJSON text: progressResponse
                        deploymentStatus = json?.data?.status
                            ?.toString()
                            ?.toUpperCase()
                        if (!deploymentStatus) {
                            error(
                                "Response progress tidak memiliki data.status"
                            )
                        }
                        echo "Deployment Status: ${deploymentStatus}"
                        // ==================================================
                        // SUCCESS
                        // ==================================================
                        if (deploymentStatus == 'SUCCESS') {
                            echo ""
                            echo "=========================================="
                            echo "       ✅ DEPLOYMENT SUCCESS"
                            echo "=========================================="
                            break
                        }
                        // ==================================================
                        // FAIL
                        // ==================================================
                        if (deploymentStatus == 'FAIL') {
                            echo ""
                            echo "=========================================="
                            echo "       ❌ DEPLOYMENT FAILED"
                            echo "=========================================="
                            def deploymentLog =
                                json?.data?.log
                                    ?: 'Deployment failed tanpa log.'
                            echo ""
                            echo "========== DEPLOYMENT LOG =========="
                            echo deploymentLog
                            echo "===================================="
                            error(
                                "Deployment gagal untuk website " +
                                "${WEBSITE_ID}"
                            )
                        }
                        // ==================================================
                        // OTHER STATUS
                        // ==================================================
                        echo "Deployment masih berjalan..."
                    }
                    echo ""
                    echo "=========================================="
                    echo "       DEPLOYMENT FINISHED"
                    echo "=========================================="
                }
            }
        }
    }
    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {
        always {
            archiveArtifacts(
                artifacts: 'trivy-results.sarif',
                allowEmptyArchive: true
            )
        }
        success {
            echo "=========================================="
            echo "       ✅ PIPELINE SUCCESS"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
            echo "📦 Artifact: ${env.ARTIFACT_URL ?: '(not published)'}"
            echo "🚀 Website berhasil dideploy."
        }
        failure {
            echo "=========================================="
            echo "       ❌ PIPELINE FAILED"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
            echo "Periksa log stage yang merah / Console Output untuk penyebab gagal."
        }
        unstable {
            echo "=========================================="
            echo "       ⚠️ PIPELINE UNSTABLE"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
        }
    }
}
