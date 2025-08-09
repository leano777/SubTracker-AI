import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { PlusIcon, TrashIcon, DownloadIcon } from 'lucide-react';

const meta = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and motion support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    motionVariant: {
      control: 'select',
      options: ['fade-in', 'slide-up', 'scale-in'],
      description: 'The animation variant for the button',
    },
    disableMotion: {
      control: 'boolean',
      description: 'Disable all motion animations',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    onClick: () => console.log('Button clicked'),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default stories
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <PlusIcon />,
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon />
        Add Item
      </>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Download
        <DownloadIcon />
      </>
    ),
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <TrashIcon />
        Delete
      </>
    ),
  },
};

// Motion variants
export const FadeIn: Story = {
  args: {
    children: 'Fade In',
    motionVariant: 'fade-in',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with fade-in animation',
      },
    },
  },
};

export const SlideUp: Story = {
  args: {
    children: 'Slide Up',
    motionVariant: 'slide-up',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with slide-up animation',
      },
    },
  },
};

export const ScaleIn: Story = {
  args: {
    children: 'Scale In',
    motionVariant: 'scale-in',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with scale-in animation',
      },
    },
  },
};

export const NoMotion: Story = {
  args: {
    children: 'No Animation',
    disableMotion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with animations disabled',
      },
    },
  },
};

// State variants
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
};

// Group showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <PlusIcon />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button sizes displayed together',
      },
    },
  },
};
