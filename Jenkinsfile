// Jenkinsfile for process-management-backend
// Place at the ROOT of https://github.com/Javith17/process-management-backend
// Runs on every push to main (GitHub webhook) and deploys on the same VPS.

pipeline {
    agent any

    triggers {
        githubPush()                 // fired by the GitHub webhook -> https://<jenkins>/github-webhook/
        // pollSCM('H/2 * * * *')    // use this instead if Jenkins is not reachable from the internet
    }

    environment {
        DEPLOY_USER = 'root'         // the Linux user that owns the pm2 processes (`ps -o user= -p $(pgrep -f "PM2")`)
    }

    options {
        disableConcurrentBuilds()    // two quick pushes = two deploys in sequence, never in parallel
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timestamps()
    }

    stages {
        stage('Deploy backend') {
            when { expression { env.GIT_BRANCH == null || env.GIT_BRANCH.endsWith('/main') || env.GIT_BRANCH == 'main' } }
            steps {
                echo "Deploying ${env.GIT_COMMIT}"
                sh 'sudo -n -H -u "$DEPLOY_USER" /opt/deploy/deploy-backend.sh "$GIT_COMMIT"'
            }
        }
    }

    post {
        success { echo "Backend deployed: ${env.GIT_COMMIT}" }
        failure { echo 'Backend deploy FAILED. The previous version keeps running unless the failure was after the pm2 reload. See the log above.' }
    }
}
