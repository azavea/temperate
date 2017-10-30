#!groovy

node {
    try {
        // Checkout the proper revision into the workspace.
        stage('checkout') {
            checkout scm
        }

        env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()

        // Execute `cibuild` wrapped within a plugin that translates
        // ANSI color codes to something that renders inside the Jenkins
        // console.
        stage('cibuild') {
            wrap([$class: 'AnsiColorBuildWrapper']) {
                sh 'scripts/cibuild'

                step([$class: 'WarningsPublisher',
                    parserConfigurations: [[
                        parserName: 'JSLint',
                        pattern: 'src/angular/planit/violations.xml'
                    ], [
                        parserName: 'Pep8',
                        pattern: 'src/django/violations.txt'
                    ]],
                    // mark build unstable if there are any linter warnings
                    unstableTotalAll: '0',
                    usePreviousBuildAsReference: true
                ])
            }
        }

        if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME.startsWith('release/')) {
            env.AWS_DEFAULT_REGION = 'us-east-1'
            env.AWS_PROFILE = 'climate'

            // Publish container images built and tested during `cibuild`
            // to the private Amazon Container Registry tagged with the
            // first seven characters of the revision SHA.
            stage('cipublish') {
                // Decode the ECR endpoint stored within Jenkins.
                withCredentials([[$class: 'StringBinding',
                                  credentialsId: 'CC_AWS_ECR_ENDPOINT',
                                  variable: 'PLANIT_AWS_ECR_ENDPOINT']]) {
                    wrap([$class: 'AnsiColorBuildWrapper']) {
                        sh './scripts/cipublish'
                    }
                }
            }

            // Plan and apply the current state of the instracture as
            // outlined by the `develop` branch of the `climate-planit`
            // repository.
            stage('infra') {
                wrap([$class: 'AnsiColorBuildWrapper']) {
                    sh 'docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra plan'
                    sh 'docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra apply'
                }
            }
        }
    } catch (err) {
        // Some exception was raised in the `try` block above. Assemble
        // an appropirate error message for Slack.
        def slackMessage = ":jenkins-angry: *doe-climate-change (${env.BRANCH_NAME}) #${env.BUILD_NUMBER}*"
        if (env.CHANGE_TITLE) {
            slackMessage += "\n${env.CHANGE_TITLE} - ${env.CHANGE_AUTHOR}"
        }
        slackMessage += "\n<${env.BUILD_URL}|View Build>"
        slackSend  channel: '#doe-climate-change', color: 'danger', message: slackMessage

        // Re-raise the exception so that the failure is propagated to
        // Jenkins.
        throw err
    } finally {
        // Pass or fail, ensure that the services and networks
        // created by Docker Compose are torn down.
        sh 'docker-compose down -v'
    }
}
