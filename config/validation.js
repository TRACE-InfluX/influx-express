var check_for_errors = function(input, required = {}, optional = {}) {
  
  let errors = {}
  
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

  return errors
}

module.exports = check_for_errors