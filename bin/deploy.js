const spawnSync = require("child_process").spawnSync;

const config = require('dotenv').config()

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
  
  console.log('docker build')
  spawn(`docker build -t ${process.env.DOCKER_REPO}:${sha} .`)

  console.log('docker login')
  spawn(spawn('aws ecr get-login --no-include-email'))

  console.log('docker push')
  spawn(`docker push ${process.env.DOCKER_REPO}:${sha}`)
}

function deploy() {
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
    "memory": 64,
    "image": `${process.env.DOCKER_REPO}:${sha}`,
    "name": "rowan"
  }]
  
  console.log('making new TaskDefinition')
  const out = spawn(`aws ecs register-task-definition --family rowan --container-definitions ${JSON.stringify(containerDefinitions)}`)

  const revision = JSON.parse(out).taskDefinition.revision
  
  console.log('updating service')
  spawn(`aws ecs update-service --service rowan --task-definition rowan:${revision}`)
}

// build();
deploy()
