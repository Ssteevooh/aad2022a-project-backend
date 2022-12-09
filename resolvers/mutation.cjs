const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    AuthenticationError,
    ForbiddenError,
} = require("apollo-server-express");
const mongoose = require("mongoose");
require("dotenv").config();

const gravatar = require("../util/gravatar.cjs");

module.exports = {
    signUp: async (parent, { username, email, password }, { models }) => {
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed,
            });
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error("Error creating account");
        }
    },
    signIn: async (parent, { email, password }, { models }) => {
        if (email) {
            email = email.trim().toLowerCase();
        }
        const user = await models.User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("Error signing in");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError("Error signing in");
        }

        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    },
    leaveFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to leave family");
        }
        const family = await models.Note.findOne({ members: user.id });
        // Remove from family !
        await models.User.findOneAndUpdate(
            { id: user.id },
            { family: null },
            { new: true }
        );
        return "OK";
    },
    createFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to create a family");
        }
        const result = await models.Note.create({
            family_name: args.family_name || null,
            owner: mongoose.Types.ObjectId(user),
        });
        return result;
    },
    deleteFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete family");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError("You must be owner of family to delete it");
        }
        await models.Family.findOneAndDelete({ id: args.family_id });
        await models.User.updateMany({ family: args.family_id }, { family: null });
        return "Family deleted";
    },
    inviteMember: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to invite members");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of family to invite members"
            );
        }
        await models.User.findByIdAndUpdate(
            args.user_id,
            {
                $push: {
                    invitations: mongoose.Types.ObjectId(args.family_id),
                },
            },
            {
                new: true,
            }
        );
        return true;
    },
    deleteMember: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete members");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of family to delete members"
            );
        }
        await models.Family.findByIdAndUpdate(
            args.family_id,
            {
                $pull: {
                    members: mongoose.Types.ObjectId(args.user_id),
                },
            },
            {
                new: true,
            }
        );
        return true;
    },
    updateFamily: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update family");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (!family || family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of family to update family"
            );
        }
        if (!args.family_name) {
            throw new ForbiddenError("You must provide some name for family");
        }
        return await models.Family.findByIdAndUpdate(
            args.family_id,
            { family_name: args.family_name },
            {
                new: true,
            }
        );
    },
    createItem: async (parent, args, { models, user }) => {
        return await models.Item.create({
            name: args.name,
            description: args.description,
            price: args.price,
        });
    },
    deleteItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete items");
        }
        await models.Item.findOneAndDelete({ _id: args.family_id });
        //TODO remove also from shopping lists
        return "Item deleted";
    },
    updateItem: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update items");
        }
        const updateObject = {};
        if (args.description) updateObject.description = args.description;
        if (args.price) updateObject.price = args.price;
        if (args.name) updateObject.name = args.name;
        return await models.Item.findByIdAndUpdate(args.item_id, updateObject, {
            new: true,
        });
    },
    createListItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to delete list items"
            );
        }
        const shoppingList = await models.ShoppingList.findOne({
            _id: args.shopping_list_id,
        });
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        return await models.ListItem.create({
            shopping_list: mongoose.Types.ObjectId(args.shopping_list_id),
            notes: args.notes || null,
            quantity: args.quantity || 1,
        });
    },
    deleteListItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete items");
        }
        const shoppingList = await models.ShoppingList.findOne({
            _id: args.shopping_list_id,
        });
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        await models.ListItem.findOneAndDelete({ _id: args.list_item_id });
        return true;
    },
    updateListItem: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update items");
        }
        const shoppingList = await models.ShoppingList.findOne({
            _id: args.shopping_list_id,
        });
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        const updateObject = {};
        args.collected
            ? (updateObject.collected = true)
            : (updateObject.collected = false);
        if (args.quantity) updateObject.quantity = args.quantity;
        if (args.notes) updateObject.notes = args.notes;
        return await models.Item.findByIdAndUpdate(
            args.list_item_id,
            updateObject,
            {
                new: true,
            }
        );
    },
    createShoppingList: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to create a shopping list"
            );
        }
        const foundUser = await models.User.findOne({ _id: user });
        const result = await models.ShoppingList.create({
            name: args.name || null,
            owner_family: mongoose.Types.ObjectId(foundUser.family),
        });
        return result;
    },
    toggleShoppingList: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to toggle shopping list"
            );
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of the family to toggle shopping lists"
            );
        }
        const shoppingList = await models.ShoppingList.findById({
            id: args.shopping_list_id,
        });
        return await models.ShoppingList.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    locked: !shoppingList.locked,
                },
            },
            {
                new: true,
            }
        );
    },
    deleteShoppingList: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to delete shopping lists"
            );
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of the family to toggle shopping lists"
            );
        }
        const shoppingList = await models.ShoppingList.findById({
            id: args.shopping_list_id,
        });
        if (shoppingList.owner_family !== family._id) {
            throw new AuthenticationError(
                "You must be owner family of this shopping lists"
            );
        }
        await models.ShoppingList.findOneAndDelete({ _id: args.shopping_list_id });
        return true;
    },
};
