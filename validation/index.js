module.exports = function({required, optional = {}}) {

  return (req, res, next) => {

    if (req.headers['content-type'] !== 'application/json') {
      return res.status(400).send({ error: 'Expected Header - Content-Type: application/json' })
    }
  
    let errors = {}
    
    let input = req.body

    // Check Required Fields
    for (let key of Object.keys(required)) {
      
      const required_type = typeof required[key]
      
      if (input[key] === undefined 
      || typeof input[key] !== required_type
      || input[key] === "") {
        errors[key] = 'Expected: ' + required_type.charAt(0).toUpperCase() + required_type.slice(1)
      }
    }

    // Check Unexpected vs. Optional Fields
    for (let key of Object.keys(input)) {

      const optional_type = typeof optional[key]
      
      if (required[key] === undefined 
      && optional[key] === undefined) {
        errors[key] = 'Unexpected Parameter'
      }

      else if (optional[key] !== undefined 
      && typeof input[key] !== optional_type) {
        errors[key] = 'Expected: ' + optional_type.charAt(0).toUpperCase() + optional_type.slice(1)
      }

    }
    
    if (Object.keys(errors).length) {
      return res.status(422).send({errors})
    }
    next()
  }

}