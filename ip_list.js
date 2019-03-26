const ip = require('ip')

class IPCOUNT{
  constructor(ip_list){
    this.arrange = this.arrange.bind(this)
    this.filter = this.filter.bind(this)
    this.contains = this.contains.bind(this)
    this.count_ip = this.count_ip.bind(this)
    this.ip_list = []
    this.cidr_list = []
    this.length = 0
    this.arrange(ip_list)
    this.filter()
    this.count_ip()
  }

  arrange(ip_list){
    ip_list.forEach((ipstr)=>{
      if((/\//).test(ipstr)){
        this.cidr_list.push(ip.cidrSubnet(ipstr))
      }else if((/-/).test(ipstr)){
        //考虑可以转化成掩码的情况
        if(Number(ipstr.split(".")[3].split("-")[0]) === 0
        && [1,3,7,15,31,63,127,255].includes(Number(ipstr.split(".")[3].split("-")[1]))){
          let last_plus_1 = Number(ipstr.split(".")[3].split("-")[1]) + 1
          let mask_length = 32 - get_log_2(last_plus_1)
          let cidr_str = `${ipstr.split("-")[0]}/${mask_length}`
          this.cidr_list.push(ip.cidrSubnet(cidr_str))
        }else{
          let first = ipstr.split("-")[0]
          let prefix = first.split(".").slice(0,-1).join(".")
          let first_num = Number(first.split(".")[3])
          let last_num = Number(ipstr.split("-")[1])
          for(let i = first_num; i<= last_num; i++){
            this.ip_list.push(`${prefix}.${i}`)
          }
        }
      }else{
        this.ip_list.push(ipstr)
      }
    })
  }

  contains(cidr_1, cidr_2){
    let contains = false
    let subnetMaskLength_1 = cidr_1.subnetMaskLength
    let subnetMaskLength_2 = cidr_2.subnetMaskLength
    let greater
    let smaller
    let indicate = 0
    if(subnetMaskLength_1 < subnetMaskLength_2){
      greater = cidr_1
      smaller = cidr_2
      indicate = 1
    }else{
      greater = cidr_2
      smaller = cidr_1
      indicate = 2
    }
    if(this.ip_lte(greater.networkAddress, smaller.networkAddress) && this.ip_gte(greater.broadcastAddress, smaller.broadcastAddress)){
      contains = true
    }
    return {
      contains,
      indicate
    }
  }

  ip_gt(ip_1, ip_2){
    let ip_1_arr = ip_1.split(".").map(item => Number(item))
    let ip_2_arr = ip_2.split(".").map(item => Number(item))
    for(let i = 0; i<4 ; i++) {
      if (ip_1_arr[i] > ip_2_arr[i]) {
        return true
      }else if(ip_1_arr[i] < ip_2_arr[i]){
        return false
      }
    }
    return false
  }

  ip_gte(ip_1, ip_2){
    let ip_1_arr = ip_1.split(".").map(item => Number(item))
    let ip_2_arr = ip_2.split(".").map(item => Number(item))
    for(let i = 0; i<4 ; i++) {
      if (ip_1_arr[i] > ip_2_arr[i]) {
        return true
      }else if(ip_1_arr[i] < ip_2_arr[i]){
        return false
      }
    }
    return true
  }

  ip_lt(ip_1, ip_2){
    let ip_1_arr = ip_1.split(".").map(item => Number(item))
    let ip_2_arr = ip_2.split(".").map(item => Number(item))
    for(let i = 0; i<4 ; i++) {
      if (ip_1_arr[i] < ip_2_arr[i]) {
        return true
      }else if(ip_1_arr[i] > ip_2_arr[i]){
        return false
      }
    }
    return false
  }

  ip_lte(ip_1, ip_2){
    let ip_1_arr = ip_1.split(".").map(item => Number(item))
    let ip_2_arr = ip_2.split(".").map(item => Number(item))
    for(let i = 0; i<4 ; i++) {
      for(let i = 0; i<4 ; i++) {
        if (ip_1_arr[i] < ip_2_arr[i]) {
          return true
        }else if(ip_1_arr[i] > ip_2_arr[i]){
          return false
        }
      }
    }
    return true
  }

  filter(){
    let temp_cidr = []
    this.cidr_list.forEach((item)=>{
      let will_add = true
      temp_cidr.forEach((current, index)=>{
        let contain_result = this.contains(item, current)
        if(contain_result.contains){
          if(contain_result.indicate == 1){
            temp_cidr.splice(index, 1)
          }else{
            will_add = false
          }
        }
      })
      if(will_add){
        temp_cidr.push(item)
      }
    })
    this.cidr_list = temp_cidr

    let temp_ips = []
    this.ip_list.forEach((item)=>{
      let will_add = true
      if(temp_ips.includes(item)){
        will_add = false
      }
      if(will_add){
        this.cidr_list.forEach((current)=>{
          if(current.contains(item)){
            will_add = false
          }
        })
      }
      if(will_add){
        temp_ips.push(item)
      }
    })
    this.ip_list = temp_ips
  }

  count_ip(){
    this.length += this.ip_list.length
    this.cidr_list.forEach((cidr_item)=>{
      this.length += Math.pow(2, 32-cidr_item.subnetMaskLength)
    })
  }
}

function get_log_2(num, result=0){
  if(parseInt(num) > 1){
    return get_log_2(parseInt(num) >> 1 , result+1 )
  }else{
    return result
  }
}

module.exports = IPCOUNT