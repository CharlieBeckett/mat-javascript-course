pipeline {

    agent any

    triggers { pollSCM ('* * * * *')}

    stages {
        stage ('Install dependencies') {
            


        steps {
            //bat ""
            bat "START /B  npx webdriver-manager update && npx webdriver-manager start "
            bat "npm test"
        }
             post {
                always {
                publishHTML([
                    allowMissing    : false ,
                    alwaysLinkToLastBuild : false,
                    keepAll: false,
                    reportDir : '.tmp/report',
                    reportFiles: 'index.html',
                    reportName: 'BDD report',
                    reportTitles: ''])
            }
             }
        }
    }


}