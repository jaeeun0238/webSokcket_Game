// 구조 분해 할당
// 구조를 분해해서 
// 할당한다.$

// 1. 배열 구조분해 할당.
let fruits = ["apple", "kiwi", "orange"];
console.log(fruits[0]);

let [fruits_apple, fruits_kiwi, fruits_orange ] = ["apple", "kiwi", "orange"];
console.log(fruits_orange);


// 2. 객체 구조분해 할당.
const person = {
    age: 22,
    name: "홍길동",
    hobby: {
        firstHobby: "코딩"
       }
}
console.log("=====================")
console.clear();
console.log(person.age, person.name, person.hobby.firstHobby);

console.log("=====================")

const {age, name, hobby:{firstHobby}} = {    
    name: "홍길동", 
       age: 22,
       hobby: {
        firstHobby: "코딩"
       }
    }
console.log(name, age, firstHobby);




























