#! /bin/bash 
# 
# Acquire temperature readings to a logfile. 
# 
# Script takes commandline argument that comprises part of the log file name 
# 
# Before using the script, we need to run the following, as root: 
# 
# echo w1 > /sys/devices/bone_capemgr.9/slots 
# 
# 
 
function getTemperature (){ 
 
    #  Sometimes, the reading returns with a CRC error, so we loop 
    #  until the reading is valid. Hopefully, we don't ever need to time out.... 
    # 
    tempRaw=$( cat /sys/bus/w1/devices/w1_bus_master1/28-00000586a123/w1_slave ) 
    while [ "YES" != "$( echo $tempRaw | grep -o YES )" ]; do 
        echo $(date "+%Y-%m-%d_%H:%M:%S") $tempRaw 
        tempRaw=$( cat /sys/bus/w1/devices/w1_bus_master1/28-00000586a123/w1_slave ) 
    done 
    tempNow=$( echo $tempRaw | cut -d'=' -f3 ) 
    # echo tempNow = $tempNow 
    return $tempNow 
} 
 
export TZ="PST+7" 
tempLast=100000 
while [ 1 ]; do 
    getTemperature 
    # echo "Got "$tempNow 
    if [ $tempNow != $tempLast ]; then 
        tempLen=${#tempNow} 
        tempInt=${tempNow:0:((${tempLen}-3))} 
        tempFract=${tempNow: -3} 
        timeStamp=$(date "+%H:%M:%S") 
        filename=$(date "+%Y-%m-%d")_${1}.log 
        echo $timeStamp ${tempInt}.${tempFract} 
        echo $timeStamp ${tempInt}.${tempFract} >> ${filename} 
        tempLast=$tempNow 
    fi 
    sleep 59 
done 
