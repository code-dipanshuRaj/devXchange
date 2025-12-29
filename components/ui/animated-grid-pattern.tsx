"use client"

import {
  ComponentPropsWithoutRef,
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
} from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedGridPatternProps
  extends ComponentPropsWithoutRef<"svg"> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 36,
  className,
  maxOpacity = 0.6,
  duration = 2.5,
  repeatDelay = 0.6,
  ...svgProps
}: AnimatedGridPatternProps) {
  const id = useId()
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  // Squares include a precomputed target opacity to reduce jitter
  const [squares, setSquares] = useState<{
    id: number
    pos: [number, number]
    target: number
  }[]>([])

  function getPos(): [number, number] {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ] as [number, number]
  }

  // Generate squares — memoized so identity is stable and doesn't trigger effect loops
  const generateSquares = useCallback(
    (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(),
        // pick a subtle random target opacity between 0.25 and maxOpacity
        target: parseFloat((Math.random() * (maxOpacity - 0.25) + 0.25).toFixed(2)),
      })),
    [dimensions.width, dimensions.height, width, height, maxOpacity]
  )

  // Function to update a single square's position
  const updateSquarePosition = (id: number) => {
    setSquares((currentSquares) =>
      currentSquares.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: getPos(),
            }
          : sq
      )
    )
  }

  // Update squares to animate in (run only when dimensions or count change)
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares))
    }
  }, [dimensions.width, dimensions.height, numSquares, generateSquares])

  // Resize observer to update container dimensions
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [containerRef])

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...svgProps}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [sx, sy], id, target }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: target }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.08,
              repeatType: "reverse",
              repeatDelay,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={id}
            width={Math.max(6, width - 1)}
            height={Math.max(6, height - 1)}
            x={sx * width + 1}
            y={sy * height + 1}
            fill="currentColor"
            strokeWidth="0"
            style={{ transformOrigin: "center" }}
          />
        ))}
      </svg>
    </svg>
  )
}
