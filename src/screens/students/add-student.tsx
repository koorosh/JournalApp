import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  Header,
  Icon, Input,
  Item, Label,
  Left, Picker,
  Right,
  Subtitle,
  Text,
  Title,
} from 'native-base'
import { NavigationInjectedProps } from 'react-navigation'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

import { Group, Student } from '../../interfaces'

interface Props extends NavigationInjectedProps<any> {
  onSubmit: (student: any) => void
}

type StudentFormFields = Partial<Student & Group>

interface FormAction<T> {
  field: keyof T
  value: string
}

type FieldChangeHandler = <T>(dispatcher: React.Dispatch<FormAction<T>>, field: FormAction<T>['field']) =>
  (value: string) => void

const GROUPS_THIS_YEAR = gql`
  {
    groupsThisYear {
      id
      name
      year
    }
  }
`

interface GroupsQueryData {
  groups: Group[]
}

export const AddStudent: React.FC<Props> = (props: Props) => {
  const { loading, error, data = { groups: [] } } = useQuery<GroupsQueryData>(GROUPS_THIS_YEAR)

  if (loading) return <Text>Loading...</Text>
  if (error) return <Text>Error :(</Text>
  if (!data) return <Text>No data to display...</Text>

  const [student, dispatchStudentAction] = React.useReducer(
    (state: Partial<Student>, action: FormAction<Student>): StudentFormFields => {
      const { field, value } = action
      return {
        ...state,
        [field]: value,
      }
    }, {
      firstName: undefined,
      lastName: undefined,
      phone: undefined,
    })

  const [selectedGroup, dispatchGroupAction] = React.useReducer(
    (state: Partial<Group>, action: FormAction<Group>): Partial<Group> => {
      const { field, value } = action
      return {
        ...state,
        [field]: value,
      }
    }, {
      name: undefined,
      year: new Date().getFullYear(),
    })

  const onFieldChange: FieldChangeHandler = React.useCallback((dispatcher, field) =>
    React.useCallback((value: string) => dispatcher({ field, value }), []), [])

  const onSubmit = React.useCallback(() => props.onSubmit(student), [student])
  const onNavigateBack = React.useCallback(() => props.navigation.goBack(), [])

  const GroupsList = data.groups.map(({ name, id }) =>
    (<Picker.Item key={id} label={name} value={id}/>))

  return (
    <Container>
      <Header>
        <Left>
          <Button
            transparent={true}
            onPress={onNavigateBack}
          >
            <Text>Відмінити</Text>
          </Button>
        </Left>
        <Body>
          <Title>Учні</Title>
          <Subtitle>Subtitle</Subtitle>
        </Body>
        <Right>
          <Button
            transparent={true}
            onPress={onSubmit}
          >
            <Text>Зберегти</Text>
          </Button>
        </Right>
      </Header>
      <Content>
        <Form>
          <Item fixedLabel={true}>
            <Label>Прізвище</Label>
            <Input onChangeText={onFieldChange(dispatchStudentAction, 'lastName')}/>
          </Item>
          <Item fixedLabel={true}>
            <Label>Ім'я</Label>
            <Input onChangeText={onFieldChange(dispatchStudentAction, 'firstName')}/>
          </Item>
          <Item fixedLabel={true} last={true}>
            <Label>Телефон</Label>
            <Input onChangeText={onFieldChange(dispatchStudentAction, 'phone')}/>
          </Item>
          <Item picker={true}>
            <Picker
              mode='dropdown'
              iosIcon={<Icon name='arrow-down'/>}
              style={{ width: undefined }}
              placeholder='Клас'
              placeholderStyle={{ color: '#bfc6ea' }}
              placeholderIconColor='#007aff'
              selectedValue={selectedGroup.id}
              onValueChange={onFieldChange(dispatchGroupAction, 'id')}
            >
              {GroupsList}
            </Picker>
          </Item>
        </Form>
      </Content>
    </Container>
  )
}
