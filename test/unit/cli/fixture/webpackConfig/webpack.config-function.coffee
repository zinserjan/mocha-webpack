module.exports = (env) ->
  if env == 'test'
    return {
      target: 'node'
    }
