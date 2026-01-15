import { z } from 'zod'
import { ApiClient, BibleClient } from '@youversion/platform-core'
import type { BiblePassage, BibleVersion } from '@youversion/platform-core'

// const usfmSchema = z.enum(['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV', 'TOB', 'JDT', 'ESG', 'WIS', 'SIR', 'BAR', 'LJE', 'S3Y', 'SUS', 'BEL', '1MA', '2MA', '3MA', '4MA', '1ES', '2ES', 'MAN', 'PS2', 'ODA', 'PSS', '3ES', 'EZA', '5EZ', '6EZ', 'DAG', 'PS3', '2BA', 'LBA', 'JUB', 'ENO', '1MQ', '2MQ', '3MQ', 'REP', '4BA', 'LAO', 'LKA'])
const versionIdSchema = z.coerce.number().int().positive('Version ID must be a positive integer')
const bookSchema = z
  .string()
  .trim()
  .min(3, 'Book ID must be exactly 3 characters')
  .max(3, 'Book ID must be exactly 3 characters')
const chapterSchema = z.coerce
  .number()
  .int('Chapter must be an integer')
  .positive('Chapter must be a positive integer')
const verseSchema = z.coerce
  .number()
  .int('Verse must be an integer')
  .positive('Verse must be a positive integer')

const bibleRefSchema = z.object({
  versionId: versionIdSchema.describe('The YouVersion Bible Version ID (e.g., 111 for KJV)'),
  book: bookSchema.describe(`The 3-letter Book ID (e.g., GEN, EXO, MAT). Valid Book IDs are defined in the USFM standard.`),
  chapter: chapterSchema.describe('The chapter number within the book'),
  verse: verseSchema.describe('The verse number within the chapter (optional)').optional()
})

export default defineEventHandler(async (event) => {
  const result = await getValidatedQuery(event, bibleRefSchema.safeParse)

  if (!result.success)
    throw result.error.issues

  const runTimeConfig = useRuntimeConfig()

  const apiClient = new ApiClient({
    appKey: runTimeConfig.youversionAppKey
  })

  const bibleClient = new BibleClient(apiClient)
  const passage: BiblePassage = await bibleClient.getPassage(result.data.versionId, `${result.data.book}.${result.data.chapter}.${result.data.verse}`, 'html')

  const version: BibleVersion = await bibleClient.getVersion(result.data.versionId)

  return { passage, version }
})
