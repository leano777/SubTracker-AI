import React, { useState } from 'react';
import { DesignSystemThemeProvider, useDesignSystemTheme } from '../design-system/theme/theme-provider';
import { Button } from '../design-system/primitives/Button/Button';
import { Input } from '../design-system/primitives/Input/Input';
import { Card } from '../design-system/primitives/Card/Card';
import { Select } from '../design-system/primitives/Select/Select';
import { Checkbox } from '../design-system/primitives/Checkbox/Checkbox';
import { Switch } from '../design-system/primitives/Switch/Switch';
import { Badge } from '../design-system/primitives/Badge/Badge';
import { Alert } from '../design-system/feedback/Alert/Alert';
import { Progress, CircularProgress } from '../design-system/feedback/Progress/Progress';
import { Modal } from '../design-system/components/Modal/Modal';
import { Tabs } from '../design-system/navigation/Tabs/Tabs';
import { Breadcrumb } from '../design-system/navigation/Breadcrumb/Breadcrumb';
import { Menu } from '../design-system/navigation/Menu/Menu';
import { Table } from '../design-system/data-display/Table/Table';
import { Tooltip } from '../design-system/components/Tooltip/Tooltip';
import { Container } from '../design-system/layout/Container/Container';
import { Grid, GridItem } from '../design-system/layout/Grid/Grid';
import { Stack, HStack, VStack } from '../design-system/layout/Stack/Stack';
import { ToastProvider, useToast } from '../design-system/feedback/Toast/Toast';
import { 
  Home, Settings, User, Bell, Search, Download, Upload, 
  ChevronRight, Plus, Trash, Edit, Sun, Moon 
} from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useDesignSystemTheme();
  
  return (
    <HStack spacing="sm">
      <Button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        variant="ghost"
        size="sm"
        leftIcon={resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      >
        {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
      </Button>
    </HStack>
  );
}

function DesignSystemContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('components');
  const [switchOn, setSwitchOn] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { addToast } = useToast();

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Name', accessor: (item: any) => item.name },
    { key: 'email', header: 'Email', accessor: (item: any) => item.email },
    { key: 'role', header: 'Role', accessor: (item: any) => <Badge variant="primary">{item.role}</Badge> },
    { key: 'status', header: 'Status', accessor: (item: any) => (
      <Badge variant={item.status === 'Active' ? 'success' : 'secondary'}>{item.status}</Badge>
    )},
  ];

  const tabs = [
    {
      id: 'components',
      label: 'Components',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="lg">
          <Card title="Buttons" description="Interactive button components">
            <Stack spacing="sm">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </Stack>
          </Card>

          <Card title="Inputs" description="Form input components">
            <Stack spacing="sm">
              <Input
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Select
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                placeholder="Select an option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
            </Stack>
          </Card>

          <Card title="Toggles" description="Switch and checkbox components">
            <Stack spacing="md">
              <Checkbox
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
                label="Checkbox option"
              />
              <Switch
                checked={switchOn}
                onChange={(e) => setSwitchOn(e.target.checked)}
                label="Toggle switch"
              />
            </Stack>
          </Card>

          <Card title="Badges" description="Status and label badges">
            <HStack spacing="sm" wrap>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </HStack>
          </Card>

          <Card title="Progress" description="Loading and progress indicators">
            <Stack spacing="md">
              <Progress value={65} showLabel />
              <HStack spacing="md">
                <CircularProgress value={75} size="sm" showLabel />
                <CircularProgress value={50} size="md" showLabel variant="success" />
                <CircularProgress value={25} size="lg" showLabel variant="warning" />
              </HStack>
            </Stack>
          </Card>

          <Card title="Tooltips" description="Hover for helpful hints">
            <HStack spacing="md">
              <Tooltip content="This is a tooltip">
                <Button variant="secondary" size="sm">Hover me</Button>
              </Tooltip>
              <Tooltip content="Another helpful tip" placement="bottom">
                <Badge>Info Badge</Badge>
              </Tooltip>
            </HStack>
          </Card>
        </Grid>
      ),
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <Bell className="w-4 h-4" />,
      content: (
        <Stack spacing="lg">
          <Card title="Alerts" description="Contextual feedback messages">
            <Stack spacing="md">
              <Alert
                variant="info"
                title="Information"
                description="This is an informational alert message."
              />
              <Alert
                variant="success"
                title="Success!"
                description="Your action was completed successfully."
              />
              <Alert
                variant="warning"
                title="Warning"
                description="Please review this important information."
              />
              <Alert
                variant="error"
                title="Error"
                description="Something went wrong. Please try again."
              />
            </Stack>
          </Card>

          <Card title="Toasts" description="Temporary notification messages">
            <HStack spacing="sm">
              <Button
                onClick={() => addToast({
                  title: 'Success!',
                  description: 'Your changes have been saved.',
                  variant: 'success',
                })}
                variant="primary"
                size="sm"
              >
                Show Success Toast
              </Button>
              <Button
                onClick={() => addToast({
                  title: 'Error',
                  description: 'Failed to save changes.',
                  variant: 'error',
                })}
                variant="destructive"
                size="sm"
              >
                Show Error Toast
              </Button>
            </HStack>
          </Card>
        </Stack>
      ),
    },
    {
      id: 'data',
      label: 'Data Display',
      icon: <User className="w-4 h-4" />,
      content: (
        <Card title="Table" description="Data table with sorting and selection">
          <Table
            data={tableData}
            columns={tableColumns}
            striped
            hoverable
          />
        </Card>
      ),
    },
  ];

  const menuItems = [
    { id: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => console.log('Edit') },
    { id: 'duplicate', label: 'Duplicate', onClick: () => console.log('Duplicate') },
    { id: 'separator', type: 'separator' as const },
    { id: 'delete', label: 'Delete', icon: <Trash className="w-4 h-4" />, danger: true, onClick: () => console.log('Delete') },
  ];

  return (
    <Container maxWidth="2xl" padding>
      <VStack spacing="xl">
        {/* Header */}
        <Card className="w-full">
          <HStack justify="between" align="center">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Design System Demo
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Explore all the components in the design system
              </p>
            </div>
            <HStack spacing="md">
              <ThemeToggle />
              <Menu
                items={menuItems}
                trigger={
                  <Button variant="secondary" size="sm">
                    Actions
                  </Button>
                }
              />
              <Button
                onClick={() => setModalOpen(true)}
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Open Modal
              </Button>
            </HStack>
          </HStack>
        </Card>

        {/* Breadcrumb */}
        <Card className="w-full">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
              { label: 'Design System' },
              { label: 'Components', active: true },
            ]}
          />
        </Card>

        {/* Main Content */}
        <Card className="w-full">
          <Tabs
            tabs={tabs}
            activeTab={selectedTab}
            onTabChange={setSelectedTab}
            variant="line"
            fullWidth
          />
        </Card>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          description="This is a demonstration of the modal component"
          footer={
            <HStack spacing="sm">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Save Changes
              </Button>
            </HStack>
          }
        >
          <Stack spacing="md">
            <p className="text-[var(--color-text-primary)]">
              This modal demonstrates the design system's overlay components with proper focus management and accessibility features.
            </p>
            <Alert
              variant="info"
              title="Note"
              description="Press ESC or click outside to close this modal."
            />
          </Stack>
        </Modal>
      </VStack>
    </Container>
  );
}

export default function DesignSystemDemo() {
  return (
    <DesignSystemThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--color-background-primary)]">
          <DesignSystemContent />
        </div>
      </ToastProvider>
    </DesignSystemThemeProvider>
  );
}