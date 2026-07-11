import { motion } from 'motion/react'
import { MessageSquareShare } from 'lucide-react'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { CHANNEL_TYPE_LIST } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import { EASE } from '@/constants'

/** viewBox：横向加宽以容纳左右两侧的长标签（如「自定义 Webhook」） */
const VB_W = 520
const VB_H = 440
/** 主节点圆心 */
const CENTER_X = VB_W / 2
const CENTER_Y = VB_H / 2
/** 渠道图标所在圆周半径 */
const NODE_RADIUS = 138
/** 标签距图标的额外偏移 */
const LABEL_GAP = 22
/** 图标容器尺寸 */
const ICON_SIZE = 32

interface Node {
  value: ChannelType
  label: string
  x: number
  y: number
  cx: number
  cy: number
  lx: number
  ly: number
  anchor: 'start' | 'middle' | 'end'
}

const nodes: Node[] = CHANNEL_TYPE_LIST.map((channel, index) => {
  const angle = (index / CHANNEL_TYPE_LIST.length) * Math.PI * 2 - Math.PI / 2
  const x = CENTER_X + NODE_RADIUS * Math.cos(angle)
  const y = CENTER_Y + NODE_RADIUS * Math.sin(angle)
  const lx = CENTER_X + (NODE_RADIUS + LABEL_GAP) * Math.cos(angle)
  const ly = CENTER_Y + (NODE_RADIUS + LABEL_GAP) * Math.sin(angle)
  const deg = (angle * 180) / Math.PI
  const anchor: Node['anchor'] =
    deg > -70 && deg < 70 ? 'start' : deg > 110 || deg < -110 ? 'end' : 'middle'
  // 贝塞尔控制点：连线中点沿法线轻微偏移，奇偶交替方向制造有机弧度
  const midX = (CENTER_X + x) / 2
  const midY = (CENTER_Y + y) / 2
  const swing = index % 2 === 0 ? 1 : -1
  const offset = 0.14 * NODE_RADIUS
  const cx = midX + Math.cos(angle + Math.PI / 2) * offset * swing
  const cy = midY + Math.sin(angle + Math.PI / 2) * offset * swing
  return { value: channel.value, label: channel.label, x, y, cx, cy, lx, ly, anchor }
})

export function ChannelTopology() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-auto w-full"
        role="img"
        aria-label="一个推送端点分发到多个渠道"
      >
        {/* 主节点光晕 */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={42} className="fill-primary/5" />
        <circle cx={CENTER_X} cy={CENTER_Y} r={26} className="fill-primary/10" />

        {/* 辐射曲线 */}
        {nodes.map((node, index) => (
          <motion.path
            key={`line-${node.value}`}
            d={`M ${CENTER_X} ${CENTER_Y} Q ${node.cx} ${node.cy} ${node.x} ${node.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeLinecap="round"
            className="text-border"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 + index * 0.06 }}
          />
        ))}

        {/* 渠道图标（无外边框，直接图标作节点） */}
        {nodes.map((node, index) => (
          <motion.foreignObject
            key={`node-${node.value}`}
            x={node.x - ICON_SIZE / 2}
            y={node.y - ICON_SIZE / 2}
            width={ICON_SIZE}
            height={ICON_SIZE}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.35 + index * 0.06 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <ChannelIcon type={node.value} className="h-7 w-7" />
            </div>
          </motion.foreignObject>
        ))}

        {/* 渠道标签 */}
        {nodes.map((node, index) => (
          <motion.text
            key={`label-${node.value}`}
            x={node.lx}
            y={node.ly}
            textAnchor={node.anchor}
            dominantBaseline="middle"
            className="fill-foreground font-medium"
            style={{ fontSize: 13 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.45 + index * 0.06 }}
          >
            {node.label}
          </motion.text>
        ))}
      </svg>

      {/* 中心主节点（MessageSquareShare） */}
      <div
        className="absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-background shadow-sm"
        style={{
          left: `${(CENTER_X / VB_W) * 100}%`,
          top: `${(CENTER_Y / VB_H) * 100}%`,
        }}
      >
        <MessageSquareShare className="h-6 w-6 text-primary" />
      </div>
    </div>
  )
}
