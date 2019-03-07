pipeline {

    agent any

    triggers { pollSCM ('* * * * *')}

    stages {
        stage ('Install do everything') {
            


        steps {
            bat "npm install"
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
                    reportDir : 'tmp/screenshots',
                    reportFiles: 'report.html',
                    reportName: 'Fancy pants report',
                    reportTitles: ''])
            }
             }
        }
    }


}