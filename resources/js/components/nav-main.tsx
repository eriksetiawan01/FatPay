import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Disclosure } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.children && item.children.length > 0 ? (
            <Disclosure key={item.title} as="div" className="w-full">
              {({ open }) => (
                <>
                  <Disclosure.Button as={SidebarMenuItem} className="w-full">
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title} // ✅ fixed
                      className="w-full justify-between"
                      isActive={item.children!.some(
                        (child) =>
                          child.href && page.url.startsWith(child.href)
                      )}
                    >
                      <div className="flex w-full items-center">
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                            open ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </SidebarMenuButton>
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-1 ml-6 space-y-1">
                    {item.children!.map((child) => (
                      <SidebarMenuItem key={child.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            child.href
                              ? page.url.startsWith(child.href)
                              : false
                          }
                          tooltip={child.title} // ✅ fixed
                        >
                          {child.href ? (
                            <Link href={child.href} prefetch>
                              <div className="flex items-center">
                                {child.icon && (
                                  <child.icon className="mr-2 h-4 w-4" />
                                )}
                                <span className="text-sm">{child.title}</span>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex cursor-default items-center opacity-50">
                              {child.icon && (
                                <child.icon className="mr-2 h-4 w-4" />
                              )}
                              <span className="text-sm">{child.title}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href ? page.url.startsWith(item.href) : false
                }
                tooltip={item.title} // ✅ fixed
              >
                {item.href ? (
                  <Link href={item.href} prefetch>
                    <div className="flex items-center">
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex cursor-default items-center opacity-50">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
