'use strict'
var React = require('react')
var ButtonNavigator = require('./buttonNavigator')
var Slider = require('./slider')
var style = require('./basicStyles')
var util = require('./util')
var eventManager = require('./eventManager')

module.exports = React.createClass({
  propTypes: {
    onStepChanged: React.PropTypes.func.isRequired
  },

  contextTypes: {
    traceManager: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      currentStepIndex: 0,
      traceLength: 0
    }
  },

  render: function () {
    return (
      <div style={style.container}>
        <Slider
          ref='slider'
          onChange={this.sliderMoved}
          min='0'
          max={this.state.traceLength} />
        <ButtonNavigator
          ref='buttons'
          stepIntoBack={this.stepIntoBack}
          stepIntoForward={this.stepIntoForward}
          stepOverBack={this.stepOverBack}
          stepOverForward={this.stepOverForward}
          jumpNextCall={this.jumpToNextCall}
          max={this.state.traceLength} />
      </div>
    )
  },

  componentDidMount: function () {
    // util.extend(this, eventManager)
    this.changeState(-1)
  },

  updateGlobalSelectedItem: function (value) {
    window.ethDebuggerSelectedItem = value
  },

  init: function () {
    this.refs.slider.setValue(0)
    this.changeState(-1)
  },

  newTraceAvailable: function () {
    this.init()
    var self = this
    this.context.traceManager.getLength(function (error, length) {
      if (error) {
        console.log(error)
      } else {
        self.setState({ traceLength: length })
        self.changeState(0)
      }
    })
  },

  sliderMoved: function (step) {
    if (!this.context.traceManager.inRange(step)) {
      return
    }
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  stepIntoForward: function () {
    if (!this.context.traceManager.isLoaded()) {
      return
    }
    var step = this.state.currentStepIndex + 1
    if (!this.context.traceManager.inRange(step)) {
      return
    }
    this.refs.slider.setValue(step)
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  stepIntoBack: function () {
    if (!this.context.traceManager.isLoaded()) {
      return
    }
    var step = this.state.currentStepIndex - 1
    if (!this.context.traceManager.inRange(step)) {
      return
    }
    this.refs.slider.setValue(step)
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  stepOverForward: function () {
    if (!this.context.traceManager.isLoaded()) {
      return
    }
    var step = this.context.traceManager.findStepOverForward(this.state.currentStepIndex)
    this.refs.slider.setValue(step)
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  stepOverBack: function () {
    if (!this.context.traceManager.isLoaded()) {
      return
    }
    var step = this.context.traceManager.findStepOverBack(this.state.currentStepIndex)
    this.refs.slider.setValue(step)
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  jumpToNextCall: function () {
    if (!this.context.traceManager.isLoaded()) {
      return
    }
    var step = this.context.traceManager.findNextCall(this.state.currentStepIndex)    
    this.refs.slider.setValue(step)
    this.changeState(step)
    this.props.onStepChanged(step)
  },

  changeState: function (step) {   
    this.updateGlobalSelectedItem(step)
    this.setState({
      currentStepIndex: step
    })
    this.refs.buttons.stepChanged(step)
  }
})
