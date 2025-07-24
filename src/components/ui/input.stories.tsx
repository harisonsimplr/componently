import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    className: { control: false },
  },
  args: {
    type: "text",
    placeholder: "Type here...",
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Invalid: Story = { args: { "aria-invalid": true } }
export const WithValue: Story = { args: { value: "Hello world!" } }
export const Password: Story = { args: { type: "password", placeholder: "Password" } } 