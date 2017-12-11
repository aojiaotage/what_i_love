class User {
  constructor(firstName, lastName, age) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    User.id += 1;
    this.id = User.id;
  }

  getName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static insert(firstName, lastName, age) {
    const u = new User(firstName, lastName, age);
    User.users.push(u);
    return u;
  }

  static getOneByName(firstName, lastName) {
    return User.users.find(u => u.firstName === firstName && u.lastName === lastName);
  }

  static getOneById(userId) {
    return User.users.find(u => u.id === userId);
  }

  static list(query) {
    return User.users;
  }
}

User.users = [];
User.id = 0;

module.exports = User;
