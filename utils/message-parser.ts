/**
 * 消息解析器 - 处理RPA/PSA标签检测和内容提取
 *
 * 支持以下格式：
 * 1. RPA格式: [RPA:START]{...json...}[RPA:END]
 * 2. PSA格式: [PSA:START]...content...[PSA:END] 或 [PSA:START]...content...（到末尾）
 * 3. 混合格式: [RPA:START]{...}[RPA:END][PSA:START]...[PSA:END]
 */

export interface ParsedMessage {
  hasRpaData: boolean
  hasPsaData: boolean
  rpaData?: any // 解析后的JSON数据
  psaContent?: string // PSA内容（去除标签后）
  normalContent: string // 普通内容（去除所有标签后）
  originalContent: string // 原始content（用于fallback）
  parseErrors?: string[] // 解析过程中的错误信息
}

const RPA_START_TAG = '[RPA:START]'
const RPA_END_TAG = '[RPA:END]'
const PSA_START_TAG = '[PSA:START]'
const PSA_END_TAG = '[PSA:END]'

/**
 * 解析消息内容，检测并提取RPA/PSA标签
 * @param content 原始消息内容
 * @returns 解析后的消息结构
 */
export function parseMessageContent(content: string): ParsedMessage {
  const errors: string[] = []
  let rpaData: any

  // 初始化返回对象
  const result: ParsedMessage = {
    hasRpaData: false,
    hasPsaData: false,
    normalContent: content,
    originalContent: content,
  }

  try {
    // 1. 检测并解析RPA数据
    const rpaMatch = extractRpaContent(content)
    if (rpaMatch) {
      try {
        rpaData = JSON.parse(rpaMatch.jsonString)
        result.hasRpaData = true
        result.rpaData = rpaData

        // 从content中移除RPA标签和内容
        content = content.replace(
          new RegExp(`\\${RPA_START_TAG}[\\s\\S]*?\\${RPA_END_TAG}`),
          '',
        )
      } catch (jsonError) {
        console.error('[Parser] RPA JSON parsing failed:', jsonError)
        console.error('[Parser] Raw JSON string:', rpaMatch.jsonString)
        errors.push(`RPA JSON parsing failed: ${jsonError}`)
      }
    }

    // 2. 检测并解析PSA内容
    const psaMatch = extractPsaContent(content)
    if (psaMatch) {
      result.hasPsaData = true
      result.psaContent = psaMatch.content.trim()

      // 从content中移除PSA标签和内容
      content = content.replace(
        new RegExp(`\\${PSA_START_TAG}[\\s\\S]*?(\\${PSA_END_TAG}|$)`),
        '',
      )
    }

    // 3. 设置清理后的普通内容
    result.normalContent = content.trim()
  } catch (error) {
    errors.push(`Parsing failed: ${error}`)
  }

  // 4. 添加错误信息（如果有）
  if (errors.length > 0) {
    result.parseErrors = errors
  }

  return result
}

/**
 * 提取RPA标签之间的JSON内容
 * @param content 消息内容
 * @returns 提取的JSON字符串，如果未找到则返回null
 */
function extractRpaContent(content: string): { jsonString: string } | null {
  const startIndex = content.indexOf(RPA_START_TAG)
  const endIndex = content.indexOf(RPA_END_TAG)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null
  }

  const jsonString = content.substring(
    startIndex + RPA_START_TAG.length,
    endIndex,
  ).trim()

  return { jsonString }
}

/**
 * 提取PSA标签之间的内容
 * @param content 消息内容
 * @returns 提取的内容，如果未找到则返回null
 */
function extractPsaContent(content: string): { content: string } | null {
  const startIndex = content.indexOf(PSA_START_TAG)

  if (startIndex === -1) {
    return null
  }

  // 检测是否有END标签
  const endIndex = content.indexOf(PSA_END_TAG, startIndex)

  let psaContent: string
  if (endIndex !== -1) {
    // 如果有END标签，提取START和END之间的内容
    psaContent = content.substring(
      startIndex + PSA_START_TAG.length,
      endIndex,
    )
  } else {
    // 如果没有END标签，提取到末尾（向后兼容）
    psaContent = content.substring(startIndex + PSA_START_TAG.length)
  }

  return { content: psaContent }
}

/**
 * 工具函数：检查消息是否包含RPA或PSA标签
 * @param content 消息内容
 * @returns 是否包含特殊标签
 */
export function hasSpecialTags(content: string): boolean {
  return content.includes(RPA_START_TAG)
    || content.includes(RPA_END_TAG)
    || content.includes(PSA_START_TAG)
}

/**
 * 工具函数：清理所有标签，返回纯文本内容
 * @param content 消息内容
 * @returns 清理后的纯文本
 */
export function cleanAllTags(content: string): string {
  return content
    .replace(new RegExp(`\\${RPA_START_TAG}[\\s\\S]*?\\${RPA_END_TAG}`, 'g'), '')
    .replace(new RegExp(`\\${PSA_START_TAG}[\\s\\S]*?(\\${PSA_END_TAG}|$)`, 'g'), '')
    .trim()
}

// 开发和调试用的测试数据
export const mockTestData = {
  rpaOnly: `${RPA_START_TAG}{"discussion_script":[{"speaker":"SRL助教","content":"这个问题很有意思"},{"speaker":"同桌","content":"我也这么认为"}],"requires_solution":true,"summary_for_solver":"需要进一步分析"}${RPA_END_TAG}`,

  psaOnly: `${PSA_START_TAG}这是PSA的流式内容，可能包含**markdown**格式。`,

  mixed: `${RPA_START_TAG}{"discussion_script":[{"speaker":"学术专家","content":"基于以上分析"}],"requires_solution":true}${RPA_END_TAG}${PSA_START_TAG}## 具体建议\n\n1. 优化写作结构\n2. 增强论证逻辑`,

  normal: '这是普通的消息内容，没有任何特殊标签。',

  malformed: `${RPA_START_TAG}{"invalid": json}${RPA_END_TAG}正常内容`,
}
