/**
 * adds additional functionality of starting or resetting the validation of composed components
 * also passes the validationProperties (defined at the end of comments) to updateValidation function
 *
 * props :
 * shouldValidate         - boolean prop that should be true to start the validation and false to stop the validation
 * shouldResetValidations - boolean prop to reset the validation of the component when specified as true
 *
 *  make sure to toggle these boolean props from true to false
 *  else it could lead to infinite component update loop
 *
 * props/context:
 * updateValidation - updateValidation is used to pass the child component's validationProperties to its parent.
 *                    this function can be passed via props or context (preference is given to props)
 *
 * props/component ref
 * validate     - function that will validate the component and return its validationProperties.
 *                user can have the validate function in component itself instead of having it as its props,
 *                then validate will be called from component ref ( For validations that depend on component internal state)
 *
 * definition
 * validationProperties - object or array of objects with following attributes
 * - componentKey : [required] key to uniquely identify the component
 * - inProgress   : [optional] boolean flag to indicate whether component's validation is in progress
 * - [ Any other fields you want to use in validation ]
 *
 * Sample Examples of validationProperties :
 * - Array of objects : [
 *                        { componentKey: 'TodoList' , errorText : 'List cannot be empty' },
 *                        { componentKey: 'Filter', errorText 'Filter is not valid', filters: [ 'Deleted', 'Saved' ] }
 *                      ]
 *  'errorText' ,'filters'
 * - Simple object : { componentKey: 'CreditCardInput' , inProgress : true,
 *                     progressMessage: 'Please wait... We are verifying the credit card information' }
 *
 */

import React, { Component, PropTypes} from 'react';
import _castArray from 'lodash.castarray';
import _isEmpty from 'lodash.isempty';
import invariant from 'invariant'

const withValidation = (ComposedComponent) => class WithValidation extends Component {

  static contextTypes = {
    updateValidation: PropTypes.func // required field. can be passed via props too
  };

  static propTypes = {
    validate: PropTypes.func, // required field. can be present as component's internal function too. 
    shouldValidate: PropTypes.bool,
    shouldResetValidation: PropTypes.bool,

    updateValidation: PropTypes.func // required field. can be passed via context too
  };

  constructor(props, context) {
    super(props, context);
    // for stateless functional components we cannot attach ref to ComposedComponent
    this.canAttachRef = ComposedComponent.prototype instanceof Component;
    this.componentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';

    invariant(props.updateValidation || context.updateValidation,
      `Could not find required "updateValidation" function in either the context or props of ` +
      `"${this.componentName}" for withValidation HOC.`
    );
  }

  getComponentValidationProperties = () => {
    const
      props = this.props,
      validate = props.validate || ( this.refs.composedComponent && this.refs.composedComponent.validate );
    // use validate function from composedComponent if not provided in props

    let validationProperties;

    validate && ( validationProperties = validate(props) );

    // save all the componentKeys for shouldResetValidation
    validationProperties && ( this.componentKeys = _castArray(validationProperties).map(vP => vP.componentKey) );

    invariant(validate,
      `Could not find necessary "validate" function in either the props or ref of ` +
      `"${this.componentName}" for withValidation HOC.`
    );

    return validationProperties;
  };

  componentDidUpdate(prevProps, prevState) {
    const
      props = this.props,
      updateValidation = this.props.updateValidation || this.context.updateValidation;

    if (props.shouldValidate) {
      updateValidation && updateValidation(this.getComponentValidationProperties());

    } else if (props.shouldResetValidation) {
      !_isEmpty(this.componentKeys) && updateValidation && updateValidation(this.componentKeys.map(componentKey => ({componentKey})));
    }
  }

  render() {
    const updateValidation = this.props.updateValidation || this.context.updateValidation;
    if (this.canAttachRef) {
      return <ComposedComponent ref="composedComponent" {...this.props} updateValidation={updateValidation}/>
    }
    return <ComposedComponent {...this.props} updateValidation={updateValidation}/>
  }
};

export const withValidationDecorator = () => withValidation; // for es2015 class decorators "@withValidationDecorator"
export default withValidation;
