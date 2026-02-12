import armourData from '../data/armourData'
import equipmentData from '../data/equipmentData'
import weaponsData from '../data/weaponsData'

/**
 * Consolidates all item data into a single map for easy lookup.
 */
const processItems = (items, category) => {
        return items.reduce((acc, item) => {
                if (item.id) {
                        acc[item.id] = { ...item, category }
                }
                return acc
        }, {})
}

const allItems = {
        ...processItems(equipmentData, 'gear'),
        ...processItems(weaponsData, 'weapon'),
        ...processItems(armourData, 'armour')
}

/**
 * Resolves a pack's items into a list of displayable objects.
 * Handles conditional logic based on character class.
 *
 * @param {Array} packItems - The items array from a pack object.
 * @param {string} characterClass - The class of the character (e.g. 'Cleric').
 * @returns {Array} List of resolved items with name, quantity, and id.
 */
export const resolvePackItems = (packItems, characterClass) => {
        return packItems.map((itemRef) => {
                let resolvedId = itemRef.id
                let quantity = itemRef.quantity

                // Handle conditional items
                if (resolvedId === 'special_class_item' && itemRef.options) {
                        const classOption = itemRef.options.find(
                                (opt) => opt.class === characterClass
                        )
                        const defaultOption = itemRef.options.find((opt) => opt.default)
                        const selected = classOption || defaultOption

                        if (selected) {
                                resolvedId = selected.id
                        }
                }

                const itemData = allItems[resolvedId]

                if (!itemData) {
                        console.warn(`Item ID not found: ${resolvedId}`)
                        return {
                                id: resolvedId,
                                name: 'Unknown Item',
                                quantity: quantity,
                                price: 0
                        }
                }

                return {
                        ...itemData,
                        quantity
                }
        })
}

/**
 * Calculates the total cost of a pack for a given class.
 *
 * @param {Array} packItems
 * @param {string} characterClass
 * @returns {number} Total price in gold.
 */
export const calculatePackPrice = (packItems, characterClass) => {
        const resolvedItems = resolvePackItems(packItems, characterClass)
        return resolvedItems.reduce((total, item) => {
                return total + (item.price * item.quantity)
        }, 0)
}
