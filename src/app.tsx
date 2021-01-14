import 'react-native-gesture-handler'
import * as React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createAppContainer } from 'react-navigation'
import { ApolloProvider } from '@apollo/react-hooks'
import ApolloClient from 'apollo-boost'

import { Attendance } from './screens/attendance'
import { Settings } from './screens/settings'
import { AddStudent, Students } from './screens/students'
import { Screens } from './screens'

const client = new ApolloClient({
  uri: 'http://localhost:8090/graphql',
})

const MainNavigator = createStackNavigator({
  [Screens.ATTENDANCE]: {
    screen: Attendance,
  },
}, {
  initialRouteName: Screens.ATTENDANCE,
  defaultNavigationOptions: {
    header: null,
  },
})

const SettingsNavigator = createStackNavigator({
  [Screens.SETTINGS]: {
    screen: Settings,
  },
  [Screens.ADD_STUDENT]: {
    screen: AddStudent,
  },
  [Screens.STUDENTS]: {
    screen: Students,
  },
}, {
  initialRouteName: Screens.SETTINGS,
  defaultNavigationOptions: {
    header: null,
  },
})

const TabNavigator = createBottomTabNavigator({
  [Screens.HOME]: {
    screen: MainNavigator,
  },
  [Screens.SETTINGS]: {
    screen: SettingsNavigator,
  },
}, {
  initialRouteName: Screens.HOME,
})

const NavigationApp = createAppContainer(TabNavigator)

const App = () => (
  <ApolloProvider client={client}>
    <NavigationApp/>
  </ApolloProvider>
)

export default App
