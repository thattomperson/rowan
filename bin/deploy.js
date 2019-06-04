const spawnSync = require("child_process").spawnSync;

const config = require('dotenv').config()
require('debug').enable("rowan:*")


function spawn(command) {
  const args = command.split(/ +/);
	const commandName = args.shift();

  const out = spawnSync(commandName, args, {
    env: {...process.env, AWS_PROFILE: 'personal'},
  })

  if (out.status !== 0) {
    throw new Error(out.stderr.toString())
  }

  return out.stdout.toString().trim()
}

const sha = spawn('git rev-parse --verify HEAD')

function build() {
  const debug = require('debug')('rowan:build')
  
  debug('building container')
  spawn(`docker build -t ${process.env.DOCKER_REPO}:${sha} .`)

  debug('loging into container registry')
  spawn(spawn('aws ecr get-login --no-include-email'))

  debug('pushing container to registry')
  spawn(`docker push ${process.env.DOCKER_REPO}:${sha}`)
  debug('done')
}

function deploy() {
  const debug = require('debug')('rowan:deploy')
  let env = [];
  for (name in config.parsed) {
    env.push({
      name,
      value: config.parsed[name] 
    })
  }

  const containerDefinitions = [{
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {"awslogs-group": "/ecs/rowan", "awslogs-region": "ap-southeast-2", "awslogs-stream-prefix": "ecs"}
    },
    "environment": env,
    "memory": 256,
    "image": `${process.env.DOCKER_REPO}:${sha}`,
    "name": "rowan"
  }]
  
  debug('making new TaskDefinition')
  const out = spawn(`aws ecs register-task-definition --family rowan --container-definitions ${JSON.stringify(containerDefinitions)}`)

  const revision = JSON.parse(out).taskDefinition.revision
  
  debug('updating service')
  spawn(`aws ecs update-service --service rowan --task-definition rowan:${revision}`)
  debug('done')
}

build();
deploy()
