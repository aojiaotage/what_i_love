class Subscription {
  constructor(userId, url) {
    this.userId = userId;
    this.url = url;
  }

  static list() {
    return Subscription.subscriptions;
  }

  static insert(userId, url) {
    const sub = new Subscription(userId, url);
    Subscription.subscriptions.push(sub);
    return sub;
  }

  static findByUserId(userId) {
    return Subscription.subscriptions.map(s => s.userId === userId);
  }
}

Subscription.subscriptions = [];

module.exports = Subscription;
