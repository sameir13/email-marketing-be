const AuthenticationRoutes = require("./authentication/index")
const SenderRoutes = require("./senders/index")

function AppConfig(app){
    app.use('/api/auth', AuthenticationRoutes)
    app.use('/api/senders', SenderRoutes)
}


module.exports = AppConfig