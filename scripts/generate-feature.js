import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const featureName = process.argv[2]

if (!featureName) {
  console.error('\n❌ Please provide a feature name!')
  console.log('Usage: npm run gen:feature <feature-name>')
  console.log('Example: npm run gen:feature warranties\n')
  process.exit(1)
}

const cleanName = featureName.toLowerCase().replace(/[^a-z0-9_-]/g, '')
const pascalName = cleanName
  .split(/[-_]/)
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join('')

const featureDir = path.resolve(__dirname, '../src/features', cleanName)

if (fs.existsSync(featureDir)) {
  console.error(`\n❌ Feature "${cleanName}" already exists at: ${featureDir}\n`)
  process.exit(1)
}

// Create subfolders
fs.mkdirSync(path.join(featureDir, 'api'), { recursive: true })
fs.mkdirSync(path.join(featureDir, 'components'), { recursive: true })
fs.mkdirSync(path.join(featureDir, 'pages'), { recursive: true })
fs.mkdirSync(path.join(featureDir, 'types'), { recursive: true })

// 1. types/index.ts
const typesContent = `export interface ${pascalName}Item {
  id: string
  name: string
  code: string
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
}
`

// 2. api/<cleanName>Api.ts
const apiContent = `import { baseApi } from '@/app/api/baseApi'
import type { ${pascalName}Item } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'

export const ${cleanName}Api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    get${pascalName}List: builder.query<ApiResponse<PaginatedResponse<${pascalName}Item>>, PaginationParams | void>({
      query: (params) => ({
        url: '/${cleanName}',
        params: params || {},
      }),
    }),
    create${pascalName}: builder.mutation<ApiResponse<${pascalName}Item>, Partial<${pascalName}Item>>({
      query: (body) => ({
        url: '/${cleanName}',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGet${pascalName}ListQuery,
  useCreate${pascalName}Mutation,
} = ${cleanName}Api
`

// 3. pages/<PascalName>Page.tsx
const pageContent = `import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { PlusCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ${pascalName}Item } from '../types'

const MOCK_ITEMS: ${pascalName}Item[] = [
  {
    id: '1',
    name: '${pascalName} Sample Record 1',
    code: '${cleanName.toUpperCase()}-001',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '${pascalName} Sample Record 2',
    code: '${cleanName.toUpperCase()}-002',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export default function ${pascalName}Page() {
  const [items] = useState<${pascalName}Item[]>(MOCK_ITEMS)
  const [search, setSearch] = useState('')

  const columns: ColumnDef<${pascalName}Item>[] = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      render: (item) => <span className="font-bold text-xs text-foreground">{item.name}</span>,
    },
    {
      id: 'code',
      header: 'Identifier',
      render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.code}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: 'date',
      header: 'Created Date',
      render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>,
    },
  ]

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="${pascalName} Management"
        subtitle="Manage ${cleanName} operations, status tracking and records."
        actions={
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
            New ${pascalName}
          </Button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ${cleanName}..."
      />

      <DataTable data={filtered} columns={columns} exportable exportFilename="${cleanName}-records.csv" />
    </div>
  )
}
`

// 4. index.ts barrel export
const indexContent = `export * from './types'
export * from './api/${cleanName}Api'
export { default as ${pascalName}Page } from './pages/${pascalName}Page'
`

fs.writeFileSync(path.join(featureDir, 'types', 'index.ts'), typesContent)
fs.writeFileSync(path.join(featureDir, 'api', `${cleanName}Api.ts`), apiContent)
fs.writeFileSync(path.join(featureDir, 'pages', `${pascalName}Page.tsx`), pageContent)
fs.writeFileSync(path.join(featureDir, 'index.ts'), indexContent)

console.log(`\n🎉 Feature "${cleanName}" generated successfully at:`)
console.log(`   ${featureDir}\n`)
console.log('Generated Files:')
console.log(`   - src/features/${cleanName}/types/index.ts`)
console.log(`   - src/features/${cleanName}/api/${cleanName}Api.ts`)
console.log(`   - src/features/${cleanName}/pages/${pascalName}Page.tsx`)
console.log(`   - src/features/${cleanName}/index.ts (barrel export)\n`)
console.log('Next Steps:')
console.log(`   1. Add route to: src/app/routes/routePaths.ts & AppRoutes.tsx`)
console.log(`   2. Add sidebar link to: src/config/navigation.config.ts\n`)
