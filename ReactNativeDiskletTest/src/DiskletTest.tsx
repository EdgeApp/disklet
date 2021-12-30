import { logDisklet, makeReactNativeDisklet } from 'disklet'
import * as React from 'react'
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  View
} from 'react-native'

import { tests } from './commonTests'

interface Results {
  [name: string]: undefined | true | string
}

export function DiskletTest(props: {}): JSX.Element {
  const [results, setResults] = React.useState<Results>({})

  async function runTests(): Promise<void> {
    for (const name in tests) {
      const disklet = logDisklet(makeReactNativeDisklet())
      await tests[name](disklet)
        .then(
          () => {
            setResults(results => ({ ...results, [name]: true }))
            return disklet.delete('.')
          },
          error => {
            console.log(error)
            for (const key in error) {
              console.log(key, error[key])
            }
            setResults(results => ({ ...results, [name]: String(error) }))
            return disklet.delete('.')
          }
        )
        .catch(error => {
          console.log(error.domain)
          setResults(results => ({ ...results, [name]: String(error) }))
        })
    }
  }

  React.useEffect(() => {
    runTests().catch(error => console.error(error))
  }, [])

  function statusLine(
    name: string,
    status: undefined | true | string
  ): JSX.Element {
    if (status == null) {
      return (
        <Text key={name} style={styles.running}>
          Running "{name}"
        </Text>
      )
    }
    if (status === true) {
      return (
        <Text key={name} style={styles.good}>
          Passed "{name}"
        </Text>
      )
    }
    return (
      <Text key={name} style={styles.bad}>
        Failed "{name}" ({status})
      </Text>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="#20503000"
      />
      <Text style={styles.header}>Disklet Tests</Text>
      <View style={styles.results}>
        {Object.keys(tests).map(name => statusLine(name, results[name]))}
      </View>
    </SafeAreaView>
  )
}

const testStyle = (color: string): TextStyle => ({
  color,
  margin: 5
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#205030',
    flex: 1,
    paddingTop: StatusBar.currentHeight
  },
  header: {
    color: '#ffffff',
    fontSize: 20,
    padding: 5,
    textAlign: 'center'
  },
  results: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  running: testStyle('#000000'),
  bad: testStyle('#7f4f30'),
  good: testStyle('#307f4f')
})
