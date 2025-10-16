// Firebase Demo Configuration (for testing without real Firebase project)
export const db = {
  // Mock Firestore-like interface for demo
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: () => false }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve()
    }),
    add: (data) => Promise.resolve({ id: 'demo_' + Date.now() }),
    where: () => ({
      orderBy: () => ({
        get: () => Promise.resolve({
          forEach: (callback) => {
            // Return some demo transactions
            callback({ id: 'tx_1', data: () => ({
              amount: 5000,
              description: 'Demo groceries',
              category: 'Groceries',
              allocation: '70',
              date: new Date().toISOString()
            })});
          }
        })
      })
    })
  }),
  doc: () => ({
    get: () => Promise.resolve({
      exists: () => true,
      data: () => ({
        salary: 60000,
        categories: [
          { name: 'Groceries', allocation: '70' },
          { name: 'Utilities', allocation: '30' }
        ],
        currentAllocationView: 'all',
        currentDate: new Date().toISOString()
      })
    }),
    set: () => Promise.resolve(),
    update: () => Promise.resolve()
  })
};

console.log('🔥 Firebase Demo Mode Active - Replace with real Firebase config!');