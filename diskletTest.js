/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View } from 'react-native'

import { makeReactNativeFolder } from './lib/disklet.rn.js'
import { testFolderNoData } from './test/test-helpers.js'

export default class disklet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      status: 'Testing...'
    }
  }

  componentDidMount () {
    async function test (t) {
      try {
        await testFolderNoData(folder)
        console.log('Success')
        t.setState({ status: 'Success' })
      } catch (e) {
        console.log(e)
        t.setState({ status: 'Failed' })
      }
    }

    test(this)
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{this.state.status}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})

const folder = makeReactNativeFolder()

AppRegistry.registerComponent('disklet', () => disklet)
