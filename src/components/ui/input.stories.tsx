import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { SearchIcon, MailIcon, LockIcon } from 'lucide-react';

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with motion support and comprehensive styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    motionVariant: {
      control: 'select',
      options: ['fade-in', 'slide-up', 'scale-in'],
      description: 'The animation variant for the input',
    },
    disableMotion: {
      control: 'boolean',
      description: 'Disable all motion animations',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  args: {
    onChange: () => console.log('Input changed'),
    onFocus: () => console.log('Input focused'),
    onBlur: () => console.log('Input blurred'),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default stories
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

// With values
export const WithValue: Story = {
  args: {
    value: 'Sample input value',
    placeholder: 'Enter text...',
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'Default value',
    placeholder: 'Enter text...',
  },
};

// Motion variants
export const FadeIn: Story = {
  args: {
    placeholder: 'Fade in animation',
    motionVariant: 'fade-in',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with fade-in animation',
      },
    },
  },
};

export const SlideUp: Story = {
  args: {
    placeholder: 'Slide up animation',
    motionVariant: 'slide-up',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with slide-up animation',
      },
    },
  },
};

export const ScaleIn: Story = {
  args: {
    placeholder: 'Scale in animation',
    motionVariant: 'scale-in',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with scale-in animation',
      },
    },
  },
};

export const NoMotion: Story = {
  args: {
    placeholder: 'No animation',
    disableMotion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with animations disabled',
      },
    },
  },
};

// State variants
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    value: 'Disabled with value',
    disabled: true,
  },
};

// Error state
export const Invalid: Story = {
  args: {
    placeholder: 'Invalid input',
    'aria-invalid': true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with invalid state (aria-invalid)',
      },
    },
  },
};

// Different sizes
export const FullWidth: Story = {
  args: {
    placeholder: 'Full width input',
    style: { width: '300px' },
  },
};

// Form examples
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          motionVariant="fade-in"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          motionVariant="slide-up"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          motionVariant="scale-in"
        />
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input components used in a form with different motion variants',
      },
    },
  },
};

// Input with icons (using CSS and pseudo-elements approach)
export const WithIcon: Story = {
  render: () => (
    <div className="relative w-80">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input 
        className="pl-10" 
        placeholder="Search..." 
        type="search"
        motionVariant="fade-in"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with a search icon positioned using absolute positioning',
      },
    },
  },
};

export const MultipleInputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types displayed together',
      },
    },
  },
};
