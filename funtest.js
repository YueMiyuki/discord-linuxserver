const config = require("./config.json");

const Docker = require("dockerode");
const docker = new Docker({ socketPath: config.dockerSocPath });

docker.listContainers(function (err, containers) {
  containers.forEach(function (containerInfo) {
    console.log(containerInfo);
  });
});
