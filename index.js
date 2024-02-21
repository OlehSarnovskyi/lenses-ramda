import * as R from 'ramda'

// What is it?
// A lens combines a “getter” function and a “setter” function into a single unit
// A lens allows you to “focus” in on nested properties (get, set, call function) of an object,
// and perform actions on it, whilst maintaining context of the original object.

// Why use lenses?
// We can update properties of an object, without mutating the original object.

// Notes
// 1. The lens, itself, isn't given a reference to any data.
// This makes the lens reusable and able to be applied to any data,
// as long as that data conforms to the shape required of its getter and setter arguments.
// In other words, this lens is only useful when applied to data that has a firstName property,
// which could be a person, an employee, or even a pet.

const person = {
    name: {
        first: 'John',
        last: 'Doe'
    },
    phones: [
        {type: 'home', number: '5556667777'},
        {type: 'work', number: '5554443333'}
    ]
}

// getter, setter
const getFirstName = data => data.name.first
const setFirstName = (value, data) => ({
    ...data,
    name: {
        ...data.name,
        first: value
    }
})

// lens creation
const firstNameLens = R.lens(getFirstName, setFirstName)

// The view() function takes two arguments; a lens, and an object to apply that lens to
// It then executes the len's getter function to return the value
// of the property the lens is focused on
// console.log(R.view(firstNameLens, person))

// It's also worth noting that view() is curryable,
// in that we can configure view() with just the lens and supply the object later
const sayHello = name => `Hello ${name}`
const greetPerson = R.pipe(
    R.view(firstNameLens),
    sayHello
)
// console.log(greetPerson(person)) // => "Hello John"
// console.log(greetPerson()) // => greetPerson

// The set() function also takes a lens and an object to apply that lens to,
// as well as a value to update the focused property.
// And as mentioned earlier, we get back a copy of the object
// with the focused property changed.
// And, just like view(), set() is curryable allowing you first configure it with a lens
// and value and provide it with data later.
R.set(firstNameLens, 'Jane', person)

// The over(), which acts just like set() except, instead of providing an updated value,
// you provide a function for updating the value.
// The provided function will be passed the result of the lens's getter.
// console.log(R.over(firstNameLens, R.toUpper, person))
// R.over(firstNameLens, console.log, person)
// R.over(firstNameLens, () => new Error(), person)

// The prop() more concise way for getters
// prop() is curryable, allowing us to configure it with a property name and provide the data later
// const firstNamePropIncorrect = R.propOr('name', 'first') // undefined doesn't work
// const firstNameProp = R.prop(() => 'firstName') // works
// console.log(firstNamePropIncorrect(person))

// The assoc() function works the same way, but is designed for writing rather than reading.
// In addition, it'll return a copy of the object it's writing to, which is the same functionality required by a lens setter.
const firstNameAssoc = R.assoc('firstName', 'Jane', person)
const firstNameAssoc2 = R.assoc('name.first', 'Jane', person) // 'name.first': 'Jane'
// console.log(firstNameAssoc)
// console.log(firstNameAssoc2)

// When used with a lens, we can configure assoc() with just
// the property name, and let the set() function curry the value and data through.
const firstNameLensByPropAndAssoc = R.lens(R.prop('firstName'), R.assoc('firstName'))
R.view(firstNameLensByPropAndAssoc, person)
R.set(firstNameLensByPropAndAssoc, 'Jane', person)

// Those are basics of lenses but there are other, more specialized,
// lens creation functions in Ramda. Specifically, lensProp(), lensIndex(), and lensPath().

// The lensProp() function takes a single argument; a property name and that's it!
const lastNameLens = R.lensProp('lastName') // R.lens(R.prop('...'), R.assoc('...'))
R.view(lastNameLens, person)
R.set(lastNameLens, 'Smith', person)

// The lensIndex() function works similarly to lensProp() except
// it's designed for focusing in on an array index
const firstPhoneLens = R.lensIndex(0)
console.log(R.view(firstPhoneLens, person.phones))
console.log(R.set(firstPhoneLens, {type: 'mobile', number: '5555555555'}, person.phones))


// The lensPath() takes an array with path segments leading to the nested data that we want focused.
// Each path segment can be a property name or an index. Since we're giving it the root person object,
// we get back a full copy of the person object with just the home phone number changed.
// In my opinion, this is where the lens feature really starts to shine.
// like RxJS pluck
const homePhoneNumberLens = R.lensPath(['phones', 0, 'number'])
R.view(homePhoneNumberLens, person)
R.set(homePhoneNumberLens, '5558882222', person)


// Like the lensPath() + set() function, but with regular Javascript
const [homePhone, ...otherPhones] = person.phones
const updatedPerson = {
    ...person,
    phones: [
        {...homePhone, number: '5558882222'},
        ...otherPhones
    ]
}

// One of the more powerful features of lenses is their ability to be composed together with other lenses.
// This allows you to build up new and more complex lenses from existing ones:
const phonesLens = R.lensProp('phones')
const workPhoneLens = R.lensIndex(1)
const phoneNumberLens = R.lensProp('number')

// The nice thing about this approach is that no one lens has the full knowledge of the entire shape of a person.
// Instead, each lens just keeps track of their own pieces of shape,
// relieving that responsibility from the next lens in the composition.
const workPhoneNumberLens = R.compose(
    phonesLens,
    workPhoneLens,
    phoneNumberLens
)

// console.log(R.view(workPhoneNumberLens, person))
