const ip_list = require('../index')

const list = ["112.33.21.5","112.22.3.0-29","112.22.3.1/27","112.33.21.3-15"]

const ip_list_obj = new ip_list(list)

console.log(ip_list_obj.length)