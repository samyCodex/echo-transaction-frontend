'use client'

import { useState } from 'react'
import { LogOut, User, Building2, Menu, X } from 'lucide-react'
import { Button } from './button'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) return null

  const isPersonal = user.type === 'PERSONAL'

  // return (
  //   <nav className="bg-white shadow-sm border-b">
  //     <div className="w-full px-6">
  //       <div className="flex justify-between h-16">
  //         {/* <div className="flex items-center">
  //           <div className="flex-shrink-0 flex items-center">
  //             <h1 className="text-xl font-bold text-gray-900">Echo Transaction</h1>
  //           </div>
  //         </div> */}

  //         {/* Desktop menu */}
  //         <div className="hidden md:flex items-center space-x-4">
  //           {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
  //             {isPersonal ? (
  //               <User className="h-4 w-4" />
  //             ) : (
  //               <Building2 className="h-4 w-4" />
  //             )}
  //             <span>{user.firstname} {user.lastname}</span>
  //             {!isPersonal && user.business && (
  //               <span className="text-gray-400">• {user.business.business_name}</span>
  //             )}
  //           </div> */}
  //           {/* <Button
  //             variant="ghost"
  //             size="sm"
  //             onClick={logout}
  //             className="text-gray-600 hover:text-gray-900"
  //           >
  //             <LogOut className="h-4 w-4 mr-2" />
  //             Sign Out UUU
  //           </Button> */}
  //         </div>

  //         {/* Mobile menu button */}
  //         <div className="md:hidden flex items-center">
  //           <Button
  //             variant="ghost"
  //             size="sm"
  //             onClick={() => setIsMenuOpen(!isMenuOpen)}
  //           >
  //             {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  //           </Button>
  //         </div>
  //       </div>

  //       {/* Mobile menu */}
  //       {isMenuOpen && (
  //         <div className="md:hidden">
  //           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
  //             <div className="flex items-center space-x-2 text-sm text-gray-600 px-3 py-2">
  //               {isPersonal ? (
  //                 <User className="h-4 w-4" />
  //               ) : (
  //                 <Building2 className="h-4 w-4" />
  //               )}
  //               <span>{user.firstname} {user.lastname}</span>
  //             </div>
  //             {!isPersonal && user.business && (
  //               <div className="text-sm text-gray-400 px-3 py-1">
  //                 {user.business.business_name}
  //               </div>
  //             )}
  //             <Button
  //               variant="ghost"
  //               size="sm"
  //               onClick={logout}
  //               className="w-full justify-start text-gray-600 hover:text-gray-900"
  //             >
  //               <LogOut className="h-4 w-4 mr-2" />
  //               Sign Out
  //             </Button>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </nav>
  // )
}
