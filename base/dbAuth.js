module.exports = {
  dbAuth: async function (userid) {
    const db = require('enhanced.db-new')
    const userLogin = new db.Table('user')

    if (!userLogin.get(userid)) {
      return false
    } else {
      return true
    }
  }
}
