const si = require('systeminformation')

const log = require('./log.js').log

async function test () {
  log('=====================================================', 'ci')
  log('======= CI Test for systeminformation methods =======', 'ci')
  log('=====================================================', 'ci')

  try {
    const getObject = {
      cpu: 'manufacturer, brand, speed',
      osInfo: 'platform, release',
      mem: 'total, free, used, cached',
      dockerInfo: 'containers, containersRunning',
      currentLoad: 'avgLoad, currentLoad'
    }

    const d = await si.get(getObject)

    const CLoad = Math.round(d.currentLoad.currentLoad)
    const ALoad = Math.round(d.currentLoad.avgLoad)

    const memTotal = Math.round(d.mem.total / 1024 / 1024 / 1024)
    const memUsed = Math.round(d.mem.used / 1024 / 1024 / 1024)
    const memFree = Math.round(d.mem.free / 1024 / 1024 / 1024)
    const memCached = Math.round(d.mem.cached / 1024 / 1024 / 1024)

    log('CPU:', 'debug')
    log(`Average Load: ${ALoad}` + ', ' + `Current Load: ${CLoad}`, 'debug')
    log(
      `Manufacturer: ${d.cpu.manufacturer}` +
        ', ' +
        `Brand: ${d.cpu.brand}` +
        ', ' +
        `Frequency: ${d.cpu.speed}`,
      'debug'
    )
    log('=====================================================', 'ci')
    log('Mem:', 'debug')
    log(
      `Total: ${memTotal}` +
        ', ' +
        `Used: ${memUsed}` +
        ', ' +
        `Free: ${memFree}` +
        ', ' +
        `Cached: ${memCached}`,
      'debug'
    )
    log('=====================================================', 'ci')
    log('OS:', 'debug')
    log(
      `Platform: ${d.osInfo.platform}` + ', ' + `Release: ${d.osInfo.release}`,
      'debug'
    )
    log('=====================================================', 'ci')
    log('Docker:')
    log(
      `Containers: ${d.dockerInfo.containers || 'Docker not found'}` +
        ', ' +
        `Containers Running: ${
          d.dockerInfo.containersRunning || 'Docker not found'
        }`,
      'debug'
    )
    log('=====================================================', 'ci')
    log('Test complete. Methods still work.' + '\n', 'ci')
  } catch (e) {
    throw new Error(e)
  }
}

test()
