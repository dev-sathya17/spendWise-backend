const User = require("../models/user");
const Income = require("../models/income.model");
const IncomeCategory = require("../models/incomeCategory");
const IncomeConfig = require("../models/incomeConfig");
const Expense = require("../models/expense.model");
const ExpenseCategory = require("../models/expenseCategory");
const ExpenseConfig = require("../models/expenseConfig");
const sequelize = require("../utils/db.config");

const adminController = {
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          role: "user",
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // API to fetch total count of users
  getTotalUsers: async (req, res) => {
    try {
      const totalUsers = await User.count({
        where: {
          role: "user",
        },
      });
      res.json({ totalUsers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total transaction report
  getTotalTransactionReport: async (req, res) => {
    try {
      const incomes = await Income.findAll({
        include: [
          {
            model: IncomeConfig,
            attributes: ["incomeConfigId", "userId"],
            include: [
              {
                model: IncomeCategory,
                attributes: ["name", "incomeCategoryId"],
              },
              {
                model: User,
                attributes: ["name"],
              },
            ],
          },
        ],
        attributes: [
          "description",
          "amount",
          "creditDate",
          "isRecurring",
          "incomeId",
        ],
      });

      const expenses = await Expense.findAll({
        include: [
          {
            model: ExpenseConfig,
            attributes: ["expenseConfigId", "userId"],
            include: [
              {
                model: ExpenseCategory,
                attributes: ["name", "expenseCategoryId"],
              },
              {
                model: User,
                attributes: ["name"],
              },
            ],
          },
        ],
        attributes: [
          "description",
          "amount",
          "debitDate",
          "isRecurring",
          "expenseId",
        ],
      });

      const totalExpense = await Expense.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
        ],
        include: [
          {
            model: ExpenseConfig,
            attributes: [],
          },
        ],
        raw: true,
      });

      const totalIncome = await Income.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
        ],
        include: [
          {
            model: IncomeConfig,
            attributes: [],
          },
        ],
        raw: true,
      });

      res.status(200).json({
        incomes,
        expenses,
        totalExpense: totalExpense.totalAmount,
        totalIncome: totalIncome.totalAmount,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
