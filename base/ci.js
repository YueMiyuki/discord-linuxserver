const si = require("systeminformation")

async function test () {
  console.log("==== CI Test for systeminformation methods ====")
  try {
    const getObject = {
      cpu: "manufacturer, brand, speed",
      osInfo: "platform, release",
      mem: "total, free, used, cached",
      dockerInfo: "containers, containersRunning",
      currentLoad: "avgLoad, currentLoad",
    }

    const d = await si.get(getObject)

    const CLoad = Math.round(d.currentLoad.currentLoad)
    const ALoad = Math.round(d.currentLoad.avgLoad)

    console.log("=====================================================")
    console.log("CPU:")
    console.log(`Average Load: ${ALoad}` + ", " + `Current Load: ${CLoad}`)
    console.log(
      `Manufacturer: ${d.cpu.manufacturer}` +
        ", " +
        `Brand: ${d.cpu.brand}` +
        ", " +
        `Frequency: ${d.cpu.speed}`
    )
    console.log("=====================================================")
    console.log("Mem:")
    console.log(
      `Total: ${d.mem.total}` +
        ", " +
        `Used: ${d.mem.used}` +
        ", " +
        `Free: ${d.mem.free}` +
        ", " +
        `Cached: ${d.mem.cached}`
    )
    console.log("=====================================================")
    console.log("OS:")
    console.log(
      `Platform: ${d.osInfo.platform}` + ", " + `Release: ${d.osInfo.release}`
    )
    console.log("=====================================================")
    console.log("Docker:")
    console.log(
      `Containers: ${d.dockerInfo.containers}` +
        ", " +
        `Containers Running: ${d.dockerInfo.containersRunning}`
    )
    console.log("=====================================================")
    console.log("Test complete. Methods still work.")
  } catch (e) {
    throw new Error(e)
  }
}

test()
