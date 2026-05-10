import vehiclesTree from '../data/vehicles_tree.json'

/**
 * Flattens the vehicle tree into a flat list of variants.
 */
const flattenVehicles = () => {
  const flattened = []
  
  vehiclesTree.forEach(makeEntry => {
    const make = makeEntry.make
    
    // Tentamos encontrar o país da marca a partir de qualquer variante que o tenha
    let makeCountry = ''
    makeEntry.groups?.forEach(group => {
      group.variants?.forEach(variant => {
        if (variant.country && !makeCountry) {
          makeCountry = variant.country
        }
      })
    })

    makeEntry.groups?.forEach(group => {
      group.variants?.forEach(variant => {
        flattened.push({
          make: make,
          groupName: group.name,
          model: variant.model,
          year: variant.year,
          gen: variant.gen || '',
          country: variant.country || makeCountry || 'Desconhecido',
          difficulty: variant.difficulty || 1,
          imageUrls: variant.imageUrls || []
        })
      })
    })
  })
  
  return flattened
}

export const allVehicles = flattenVehicles()

/**
 * Filtered list of vehicles that have at least one image.
 * These are the ones that can be selected as the "target" car.
 */
export const playableVehicles = allVehicles.filter(v => v.imageUrls && v.imageUrls.length > 0)

/**
 * Returns vehicles for a specific difficulty level.
 * @param {number} level - 1 (Easy), 2 (Medium), 3 (Hard)
 */
export const getVehiclesByDifficulty = (level) => {
  return playableVehicles.filter(v => v.difficulty === level)
}
