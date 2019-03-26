const ip_list = require('../ip_list')

const ip_list = ["112.33.21.5","112.22.3.0-29","112.22.3.1/27","112.33.21.3-15"]

const ip_count_obj = new ip_count(ip_list)

console.log(ip_count_obj.ip_list)

console.log(ip_count_obj.cidr_list)

console.log(ip_count_obj.length)