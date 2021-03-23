/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** filter customers by name */

  static async filterByName(name) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       WHERE first_name ILIKE '%${name}%' or last_name ILIKE '%${name}%'
       ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  static async bestCustomers() {
    const results = await db.query(
      `SELECT id,
        first_name as "firstName",
        last_name as "lastName",
        phone,
        notes FROM (
          SELECT customers.id as id, first_name, last_name, phone, customers.notes, count(first_name) as num_res
          FROM customers LEFT JOIN reservations as r ON r.customer_id = customers.id
          GROUP BY customers.id, first_name, last_name, phone, customers.notes
          ORDER BY num_res DESC) a
        LIMIT 10`
    );

    return results.rows.map((c) => new Customer(c));
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  // fullName() {
  //   let full = `${this.firstName} ${this.lastName}`;
  //   return full;
  // }
  get fullName() {
    const fullName = this.firstName + ' ' + this.lastName;
    return fullName;
  }
}

module.exports = Customer;
