'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider
const co = require('co')

class ExtendValidatorProvider extends ServiceProvider {

  uniqueValidator (data, field, message, args, get) {
    const LucidMongo = use('LucidMongo')
    const Exceptions = use('Exceptions')
    return new Promise((resolve, reject) => {
      /**
       * skip if value is empty, required validation will
       * take care of empty values
       */
      const fieldValue = get(data, field)
      if (!fieldValue) {
        return resolve('validation skipped')
      }
      const collectionName = args[0]
      const databaseField = args[1] || field
      if (!collectionName) {
        throw new Exceptions.RunTimeException('Unique rule require collection name')
      }

      co(function * () {
        let query = LucidMongo.query()
        const connection = yield query.connect()
        query = query.queryBuilder.collection(connection.collection(collectionName))
        query = query.where(databaseField).eq(fieldValue)
        /**
         * if args[2] and args[3] are available inside the array
         * take them as whereNot key/value pair to ignore
         */
        if (args[2] && args[3]) {
          query = query.where(args[2]).notEqual(args[3])
        }

        /**
         * if args[4] and args[5] are available inside the array
         * take them as where key/value pair to limit scope
         */
        if (args[4] && args[5]) {
          query = query.where(args[4]).eq(args[5])
        }

        const exists = yield query.findOne()
        return yield Promise.resolve(exists)
      }).then(function (exists) {
        console.log(exists)
        if (exists) {
          reject(message)
        } else {
          resolve('valid')
        }
      }).catch(reject)
    })
  }

  existValidator (data, field, message, args, get) {
    const LucidMongo = use('LucidMongo')
    const Exceptions = use('Exceptions')
    return new Promise((resolve, reject) => {
      /**
       * skip if value is empty, required validation will
       * take care of empty values
       */
      const fieldValue = get(data, field)
      if (!fieldValue) {
        return resolve('validation skipped')
      }
      const collectionName = args[0]
      const databaseField = args[1] || field
      if (!collectionName) {
        throw new Exceptions.RunTimeException('Unique rule require collection name')
      }
      co(function * () {
        let query = LucidMongo.query()
        const connection = yield query.connect()
        query = query.queryBuilder.collection(connection.collection(collectionName))
        query = query.where(databaseField).eq(fieldValue)
        /**
         * if args[2] and args[3] are available inside the array
         * take them as whereNot key/value pair to limit scope
         */
        if (args[2] && args[3]) {
          query = query.where(args[2]).eq(args[3])
        }

        const exists = yield query.findOne()
        return yield Promise.resolve(exists)
      }).then(function (exists) {
        console.log(exists)
        if (exists) {
          reject(message)
        } else {
          resolve('valid')
        }
      }).catch(reject)
    })
  }

  * boot () {
    // register bindings
    const Validator = use('Adonis/Addons/Validator')
    Validator.extend('unique', this.uniqueValidator, '{{field}} already exists')
    Validator.extend('exist', this.existValidator, '{{field}} is not exists')
  }

}

module.exports = ExtendValidatorProvider
