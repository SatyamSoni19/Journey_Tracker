import { ApiError } from "../utils/ApiError.js";
import { findJourneyById } from "../repositories/journey.repository.js";
import { createBudgetMember as createMemberInDb, findBudgetMembersByJourney as findMembersInDb, findBudgetMemberById as findMemberByIdInDb, deleteBudgetMember as deleteMemberInDb, createExpense as createExpenseInDb, findExpensesByJourney as findExpensesInDb, findExpenseById as findExpenseByIdInDb, updateExpense as updateExpenseInDb, deleteExpense as deleteExpenseInDb, findExpenseCategories, createExpenseCategory, ensureDefaultCategories, } from "../repositories/budget.repository.js";
async function verifyJourneyOwnership(journeyId, userId) {
    const journey = await findJourneyById(journeyId);
    if (!journey) {
        throw ApiError.notFound("Journey not found");
    }
    if (journey.ownerId !== userId) {
        throw ApiError.forbidden("You do not have access to this journey");
    }
    // Ensure default categories exist whenever we verify ownership for budget
    await ensureDefaultCategories(journeyId);
    return journey;
}
// --- Members ---
export async function addBudgetMember(journeyId, userId, input) {
    await verifyJourneyOwnership(journeyId, userId);
    return createMemberInDb(journeyId, input);
}
export async function getBudgetMembers(journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    return findMembersInDb(journeyId);
}
export async function deleteBudgetMember(memberId, journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    const member = await findMemberByIdInDb(memberId);
    if (!member || member.journeyId !== journeyId) {
        throw ApiError.notFound("Member not found");
    }
    // Checking if member is tied to any expenses can be handled gracefully by DB relations or here
    try {
        await deleteMemberInDb(memberId);
    }
    catch (error) {
        throw ApiError.badRequest("Cannot delete member because they are associated with expenses.");
    }
}
// --- Expenses ---
export async function addExpense(journeyId, userId, input) {
    await verifyJourneyOwnership(journeyId, userId);
    // Optional: verify that paidById and all split memberIds exist and belong to journey
    // (Left to DB constraints for simplicity)
    return createExpenseInDb(journeyId, input);
}
export async function getExpenses(journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    return findExpensesInDb(journeyId);
}
export async function updateExpense(expenseId, journeyId, userId, input) {
    await verifyJourneyOwnership(journeyId, userId);
    const expense = await findExpenseByIdInDb(expenseId);
    if (!expense || expense.journeyId !== journeyId) {
        throw ApiError.notFound("Expense not found");
    }
    return updateExpenseInDb(expenseId, input);
}
export async function deleteExpense(expenseId, journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    const expense = await findExpenseByIdInDb(expenseId);
    if (!expense || expense.journeyId !== journeyId) {
        throw ApiError.notFound("Expense not found");
    }
    return deleteExpenseInDb(expenseId);
}
// --- Summary ---
export async function getBudgetSummary(journeyId, userId) {
    const journey = await verifyJourneyOwnership(journeyId, userId);
    const expenses = await findExpensesInDb(journeyId);
    const members = await findMembersInDb(journeyId);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = journey.budget - totalSpent;
    // Category breakdown using real categories
    const categoryMap = new Map();
    // Initialize map with all categories for this journey
    const allCategories = await findExpenseCategories(journeyId);
    allCategories.forEach(cat => {
        categoryMap.set(cat.name, { amount: 0, color: cat.color });
    });
    expenses.forEach((exp) => {
        const catName = exp.category.name;
        const current = categoryMap.get(catName);
        if (current) {
            categoryMap.set(catName, { amount: current.amount + exp.amount, color: current.color });
        }
    });
    const categories = Array.from(categoryMap.entries())
        .filter(([_, data]) => data.amount > 0) // Only show categories with spending
        .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        color: data.color,
    }));
    return {
        totalBudget: journey.budget,
        totalSpent,
        remaining,
        currency: expenses.length > 0 ? expenses[0].currency : "INR",
        categories,
        memberCount: members.length,
        expenseCount: expenses.length,
    };
}
// --- Categories ---
export async function getCategories(journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    return findExpenseCategories(journeyId);
}
export async function addCategory(journeyId, userId, name, color) {
    await verifyJourneyOwnership(journeyId, userId);
    return createExpenseCategory(journeyId, name, color);
}
