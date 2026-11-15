pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        COMPOSER_ALLOW_SUPERUSER = '1'
        CI = 'true'
    }

    stages {
        stage('Periksa tool') {
            steps {
                sh '''
                    set -eu
                    php -v
                    composer --version
                    node --version
                    npm --version
                '''
            }
        }

        stage('Dependensi PHP') {
            steps {
                sh 'composer install --no-interaction --prefer-dist --no-progress'
            }
        }

        stage('Dependensi frontend') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Simpan hasil build') {
            steps {
                archiveArtifacts artifacts: 'public/build/**', fingerprint: true
            }
        }
    }
}
