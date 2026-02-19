import { motion, AnimatePresence } from 'framer-motion'
import { Outlet, useRouter } from '@tanstack/react-router'

export function AnimatedOutlet() {
  const router = useRouter()
  const pathname = router.state.location.pathname

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
