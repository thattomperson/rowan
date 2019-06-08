const Jimp = require('jimp')
const path = require('path')

const types = ['bug','dark','dragon','electric','fairy','fighting','fire','flying','ghost','grass','ground','ice','normal','poison','psychic','rock','steel','water']

const basePath = path.resolve(path.join('assets', 'types'))

const perms = types.map(t => types.map(s => `${t}-${s}`))

perms.map(t => t.map(async name => {
  const [p, s] = name.split('-')

  const primary = await Jimp.read(path.join(basePath, `${p}.png`))
  const secondary = await Jimp.read(path.join(basePath, `${s}.png`))

  const width = primary.getWidth() + secondary.getWidth() + 1;
  const height = primary.getHeight();

  new Jimp(width, height, (err, img) => {
    img.composite(primary, 0, 0)
    img.composite(secondary, primary.getWidth() + 1, 0)

    img.write(path.join(basePath, `${name}.png`))
  })
  

  console.log(name)
}))