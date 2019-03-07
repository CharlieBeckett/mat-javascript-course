pipeline {

    agent any

    triggers { pollSCM ('* * * * *')}

    stages {
        stage ('Install dependencies') {
            


        steps {
            bat "npx webdriver-manager update"
            bat "START /B npx webdriver-manager start "
            bat "npm test"
        }
             post {
                always {
                publishHTML([
                    allowMissing    : false ,
                    alwaysLinkToLastBuild : false,
                    keepAll: false,
                    reportDir : '.tmp/screenshots',
                    reportFiles: 'index.html',
                    reportName: 'BDD report',
                    reportTitles: ''])
            }
             }
        }
    }


}