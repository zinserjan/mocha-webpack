module.exports = (env) ->
  if env == 'test'
    return {
      mode: 'development'
      target: 'node'
    }
