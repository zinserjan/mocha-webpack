module.exports = (env, argv) ->
  if (env == 'test' && argv.mode == 'development')
    return {
      mode: 'development'
      target: 'node'
    }
